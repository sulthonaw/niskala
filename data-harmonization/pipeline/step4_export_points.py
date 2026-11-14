"""Step 4 - Per-district, per-year hotspot CSV files for the web "Download CSV" button.

Outputs: data/web/points/<district-slug>/<year>.csv and data/web/points/index.json
Written with help from Claude (AI).
"""
import os, re, json, pandas as pd
from config import INTERIM, WEB, LOCAL_UTC_OFFSET_H
P, OUT = str(INTERIM), str(WEB / "points")
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
d = pd.read_csv(os.path.join(P, "hotspots_kalbar.csv.gz"), dtype={"acq_time": str, "confidence": str}, low_memory=False)
t = pd.to_datetime(d.acq_date) + pd.to_timedelta(d.acq_time.str.zfill(4).str[:2].astype(int), unit="h") \
    + pd.to_timedelta(d.acq_time.str.zfill(4).str[2:].astype(int), unit="m") + pd.Timedelta(hours=LOCAL_UTC_OFFSET_H)
d["local_datetime_wib"] = t.dt.strftime("%Y-%m-%d %H:%M"); d["year_local"] = t.dt.year
d["data_type"] = d.source_file.str.contains("nrt").map({True: "NRT", False: "standard"})
cols = ["latitude","longitude","acq_date","acq_time","local_datetime_wib","satellite","sensor","confidence","frp","daynight","data_type","district"]
index = {}
for (dist, y), g in d.groupby(["district","year_local"]):
    p = os.path.join(OUT, slug(dist)); os.makedirs(p, exist_ok=True)
    g.sort_values(["acq_date","acq_time"])[cols].rename(columns={"acq_date":"acq_date_utc","acq_time":"acq_time_utc"}).to_csv(os.path.join(p, f"{y}.csv"), index=False)
    index.setdefault(slug(dist), {})[int(y)] = int(len(g))
json.dump(index, open(os.path.join(OUT, "index.json"), "w"), separators=(",", ":"))
print("files:", sum(len(v) for v in index.values()), "| rows:", sum(sum(v.values()) for v in index.values()))
