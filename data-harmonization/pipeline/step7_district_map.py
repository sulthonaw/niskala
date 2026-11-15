"""Step 7: export simplified district outlines for the web map.

Reads the geoBoundaries ADM2 file, keeps the 14 West Kalimantan districts,
simplifies them, projects lon/lat to SVG units (equirectangular; Kalimantan
Barat sits on the equator, so cos(lat) is ~1), and writes data/web/map.json:
{viewBox, width, height, bbox, districts: [{name, slug, path, label:[x, y]}]}.
Written with help from Claude (AI).
"""
import json
import re

from shapely.geometry import shape, mapping
from shapely.ops import unary_union

from config import BOUNDARIES, DISTRICTS, WEB

SIMPLIFY_DEG = 0.008       # about 0.9 km; keeps coastlines readable at dashboard size
WIDTH = 600                # SVG units across the province
PAD = 8

slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

g = json.load(open(BOUNDARIES))
geoms = {}
for f in g["features"]:
    name = f["properties"]["shapeName"]
    if name in DISTRICTS:
        geoms[name] = shape(f["geometry"]).buffer(0).simplify(SIMPLIFY_DEG, preserve_topology=True)
assert sorted(geoms) == sorted(DISTRICTS), set(DISTRICTS) - set(geoms)

minx, miny, maxx, maxy = unary_union(list(geoms.values())).bounds
k = (WIDTH - 2 * PAD) / (maxx - minx)
height = round((maxy - miny) * k + 2 * PAD)


def xy(lon, lat):
    return round((lon - minx) * k + PAD, 1), round((maxy - lat) * k + PAD, 1)


def ring_path(coords):
    pts = [xy(lon, lat) for lon, lat in coords]
    return "M" + "L".join(f"{x:g},{y:g}" for x, y in pts) + "Z"


def geom_path(geom):
    gj = mapping(geom)
    polys = gj["coordinates"] if gj["type"] == "MultiPolygon" else [gj["coordinates"]]
    return "".join(ring_path(ring) for poly in polys for ring in poly)


districts = []
for name in DISTRICTS:
    geom = geoms[name]
    # label at the largest part's inner point so islands do not pull it offshore
    main = max(geom.geoms, key=lambda p: p.area) if geom.geom_type == "MultiPolygon" else geom
    p = main.representative_point()
    districts.append({"name": name, "slug": slug(name), "path": geom_path(geom), "label": list(xy(p.x, p.y))})

out = {
    "viewBox": f"0 0 {WIDTH} {height}",
    "width": WIDTH,
    "height": height,
    "bbox": [round(minx, 3), round(miny, 3), round(maxx, 3), round(maxy, 3)],
    "source": "geoBoundaries gbOpen IDN ADM2 (CC BY 4.0), simplified",
    "districts": districts,
}
WEB.mkdir(parents=True, exist_ok=True)
with open(WEB / "map.json", "w") as fh:
    json.dump(out, fh, separators=(",", ":"))
print(f"map.json: {len(districts)} districts, {(WEB / 'map.json').stat().st_size / 1024:.0f} KB, viewBox {out['viewBox']}")
