"""Step 2 - Harmonize Aqua MODIS and NOAA-20 VIIRS into one monthly series per district.

* Months in local time (WIB).
* Reference = VIIRS NOAA-20; MODIS reference = Aqua (Terra excluded: orbit drift, and it is the only sensor before 2002-07).
* r_d = (N20_d + k*R) / (Aqua_d + k) over the overlap 2018-04..2025-12 (R = province ratio, k = shrinkage).
* H = Aqua * r_d before 2018-04, H = NOAA-20 from 2018-04.
* Leave-one-year-out validation 2019-2025 (district ratio vs single ratio).

Outputs: data/interim/monthly_local.csv, harmonized_monthly.csv, calibration.csv, validation.csv
Written with help from Claude (AI).
"""
import os, numpy as np, pandas as pd
from config import PARTIAL_YM, INTERIM, SHRINKAGE_K as K, OVERLAP_START as OV_START, OVERLAP_END as OV_END, VALIDATION_YEARS, HARMONIZED_START_YM, LOCAL_UTC_OFFSET_H
P = str(INTERIM)

d = pd.read_csv(os.path.join(P, "hotspots_kalbar.csv.gz"), usecols=["district","acq_date","acq_time","satellite"], dtype={"acq_time": str})
t = pd.to_datetime(d.acq_date) + pd.to_timedelta(d.acq_time.str.zfill(4).str[:2].astype(int), unit="h") \
    + pd.to_timedelta(d.acq_time.str.zfill(4).str[2:].astype(int), unit="m") + pd.Timedelta(hours=LOCAL_UTC_OFFSET_H)
d["year"], d["month"] = t.dt.year, t.dt.month
m = d.groupby(["district","year","month","satellite"]).size().unstack("satellite", fill_value=0)
districts = sorted(d.district.unique())
idx = pd.MultiIndex.from_product([districts, range(2001, 2027), range(1, 13)], names=["district","year","month"])
m = m.reindex(idx, fill_value=0)
for c in ["Terra","Aqua","N20","SNPP"]:
    if c not in m: m[c] = 0
m = m[["Terra","Aqua","N20","SNPP"]].reset_index()
m = m[~((m.year==2026)&(m.month==12))]
m["ym"] = m.year*100 + m.month
m.to_csv(os.path.join(P, "monthly_local.csv"), index=False)

def in_ov(df): return (df.ym >= OV_START[0]*100+OV_START[1]) & (df.ym <= OV_END[0]*100+OV_END[1])

def fit(df):
    ov = df[in_ov(df)]
    s = ov.groupby("district")[["Aqua","N20"]].sum()
    R = s.N20.sum() / s.Aqua.sum()
    r = (s.N20 + K*R) / (s.Aqua + K)
    return r, R, s

r, R, s = fit(m)
cal = pd.DataFrame({"aqua_overlap": s.Aqua, "n20_overlap": s.N20, "raw_ratio": (s.N20/s.Aqua.replace(0,np.nan)).round(3), "ratio": r.round(3)})
cal.loc["KALBAR"] = [s.Aqua.sum(), s.N20.sum(), round(R,3), round(R,3)]
cal.to_csv(os.path.join(P, "calibration.csv"))

# Leave-one-year-out validation
rows = []
for y in VALIDATION_YEARS:
    train = m[m.year != y]
    r_y, R_y, _ = fit(train)
    test = m[(m.year == y)]
    g = test.groupby("district")[["Aqua","N20"]].sum()
    pred_d = g.Aqua * r_y.reindex(g.index)
    pred_g = g.Aqua * R_y
    for dist in g.index:
        rows.append((y, dist, g.N20[dist], pred_d[dist], pred_g[dist]))
    rows.append((y, "KALBAR", g.N20.sum(), pred_d.sum(), pred_g.sum()))
v = pd.DataFrame(rows, columns=["year","district","actual_n20","pred_district_ratio","pred_single_ratio"])
v.to_csv(os.path.join(P, "validation.csv"), index=False)

def ape(a, p): return (np.abs(p - a) / a.replace(0, np.nan)).median() * 100
vd = v[(v.district!="KALBAR") & (v.actual_n20 >= 100)]
vk = v[v.district=="KALBAR"]
print("Calibration (ratio N20/Aqua):"); print(cal.to_string()); print()
print(f"LOYO district-year (actual>=100), median abs % error: district ratio {ape(vd.actual_n20, vd.pred_district_ratio):.1f}% | single ratio {ape(vd.actual_n20, vd.pred_single_ratio):.1f}%  (n={len(vd)})")
print(f"LOYO province-year, median abs % error: {ape(vk.actual_n20, vk.pred_district_ratio):.1f}%")
print(vk.round(0).to_string(index=False))

# Harmonized series
m = m.merge(r.rename("ratio"), left_on="district", right_index=True)
pre = m.ym < OV_START[0]*100+OV_START[1]
m["harmonized"] = np.where(pre, m.Aqua * m.ratio, m.N20)
m["source"] = np.where(pre, "Aqua x ratio", "NOAA-20")
m.loc[m.ym < HARMONIZED_START_YM, ["harmonized"]] = np.nan
m.loc[m.ym < HARMONIZED_START_YM, "source"] = "no Aqua (Terra only)"
m["naive_sum"] = m.Terra + m.Aqua + m.N20          # what simple merging would show
m["partial_month"] = (m.ym == PARTIAL_YM)
m.to_csv(os.path.join(P, "harmonized_monthly.csv"), index=False)
a = m.groupby("year")[["Terra","Aqua","N20","naive_sum","harmonized"]].sum().round(0)
print(); print(a.to_string())
