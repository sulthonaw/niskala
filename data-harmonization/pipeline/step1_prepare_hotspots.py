"""Step 1 - Prepare hotspots.

Merge FIRMS yearly country files and the 2026 archive download, keep West Kalimantan,
keep vegetation fires with sufficient confidence, and assign each hotspot to a district.

Outputs: data/interim/hotspots_kalbar.csv.gz, data/interim/filter_log.csv
Written with help from Claude (AI).
"""
import glob, json, os, sys
import numpy as np, pandas as pd
from shapely.geometry import shape, Point
from shapely import STRtree, points as shp_points

import zipfile
from config import (BBOX, DISTRICTS as KALBAR, FIRMS_YEARLY, FIRMS_2026_ZIPS, FIRMS_2026_EXTRACTED, BOUNDARIES,
                    INTERIM, MODIS_MIN_CONFIDENCE, VIIRS_DROP_CONFIDENCE)
OUT = str(INTERIM)

# Extract FIRMS Archive Download zips (archive = standard data, nrt = near-real-time)
FIRMS_2026_EXTRACTED.mkdir(exist_ok=True)
for z in sorted(FIRMS_2026_ZIPS.glob("*.zip")):
    with zipfile.ZipFile(z) as zf:
        for n in zf.namelist():
            if n.endswith(".csv") and not (FIRMS_2026_EXTRACTED / n).exists():
                zf.extract(n, FIRMS_2026_EXTRACTED)
log = []

def standardize(df, src):
    df = df.rename(columns={"bright_ti4": "brightness", "bright_ti5": "bright_t31"})
    if "type" not in df.columns: df["type"] = np.nan
    inst = df["instrument"].astype(str).str.upper()
    df["sensor"] = np.where(inst.str.contains("MODIS"), "MODIS", "VIIRS")
    sat = df["satellite"].astype(str)
    df["satellite"] = sat.replace({"T": "Terra", "A": "Aqua", "N": "SNPP", "1": "N20", "N20": "N20", "J1": "N20"})
    df["source_file"] = src
    keep = ["latitude","longitude","acq_date","acq_time","satellite","sensor","confidence","frp","daynight","type","version","source_file"]
    return df[keep]

def read(path):
    df = pd.read_csv(path, dtype={"acq_time": str, "confidence": str, "satellite": str, "version": str}, low_memory=False)
    W,S,E,N = BBOX
    df = df[(df.longitude>=W)&(df.longitude<=E)&(df.latitude>=S)&(df.latitude<=N)]
    return standardize(df, os.path.basename(path))

files = sorted(map(str, FIRMS_YEARLY.glob("*.csv"))) + sorted(map(str, FIRMS_2026_EXTRACTED.glob("*.csv")))
parts = []
for f in files:
    d = read(f); parts.append(d); print(f"{os.path.basename(f):45s} {len(d):>8,d} in box", flush=True)
df = pd.concat(parts, ignore_index=True)
df["acq_date"] = pd.to_datetime(df["acq_date"])
log.append(("in_bbox", len(df)))

# Yearly country files and 2026 archive can overlap with NRT; drop exact duplicates
df = df.drop_duplicates(subset=["latitude","longitude","acq_date","acq_time","satellite"])
log.append(("after_exact_dedup", len(df)))

# Non-vegetation sources: keep type 0; for NRT rows (no type) drop cells flagged as static land source (type 2) in archive
static = df[df["type"]==2]
cells = set(zip((static.latitude*100).round().astype(int), (static.longitude*100).round().astype(int)))
nrt = df["type"].isna()
cell_hit = pd.Series([ (a,b) in cells for a,b in zip((df.latitude*100).round().astype(int),(df.longitude*100).round().astype(int))], index=df.index)
df = df[((df["type"]==0)) | (nrt & ~cell_hit)]
log.append(("vegetation_only", len(df)))

# Confidence: MODIS numeric >=30 ; VIIRS drop 'l' (low)
is_mod = df.sensor=="MODIS"
mconf = pd.to_numeric(df["confidence"], errors="coerce")
vconf = df["confidence"].astype(str).str.lower().str[0]
df = df[(is_mod & (mconf>=MODIS_MIN_CONFIDENCE)) | (~is_mod & (vconf!=VIIRS_DROP_CONFIDENCE))]
log.append(("confidence_filter", len(df)))

# District assignment (point in polygon)
g = json.load(open(BOUNDARIES))
polys, names = [], []
for f in g["features"]:
    n = f["properties"]["shapeName"]
    if n in KALBAR:
        polys.append(shape(f["geometry"])); names.append(n)
assert sorted(names)==sorted(KALBAR), set(KALBAR)-set(names)
tree = STRtree(polys)
pts = shp_points(df.longitude.values, df.latitude.values)
pi, gi = tree.query(pts, predicate="within")
district = np.full(len(df), None, dtype=object)
district[pi] = np.array(names, dtype=object)[gi]
df["district"] = district
df = df[df["district"].notna()]
log.append(("inside_kalbar_district", len(df)))

df["year"] = df.acq_date.dt.year; df["month"] = df.acq_date.dt.month
df.to_csv(os.path.join(OUT,"hotspots_kalbar.csv.gz"), index=False, compression="gzip")
pd.DataFrame(log, columns=["step","rows"]).to_csv(os.path.join(OUT,"filter_log.csv"), index=False)
print(pd.DataFrame(log, columns=["step","rows"]).to_string(index=False))
print(df.groupby(["sensor","satellite"]).agg(n=("year","size"), first=("acq_date","min"), last=("acq_date","max")))
