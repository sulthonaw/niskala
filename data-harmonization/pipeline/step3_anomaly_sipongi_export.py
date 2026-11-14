"""Step 3 - Baseline, anomaly, SiPongi comparison, and web export.

Baseline : per district and calendar month, 2003-2025 mean, leave-one-year-out.
Anomaly  : ratio = (H + C) / (normal + C); classes -2..3; current month vs pro-rated normal.
SiPongi  : annual burned area vs harmonized hotspots; flag = area high vs the district's own pattern.

Outputs: data/interim/anomaly_monthly.csv, sipongi_compare.csv; data/web/{meta,calendar,sipongi,annual}.json
Written with help from Claude (AI).
"""
import os, json, re, numpy as np, pandas as pd
from config import INTERIM, WEB, BASELINE_YEARS as BASE, ANOMALY_C as C, PROVINCE as PROV, PARTIAL_YM, SIPONGI_DISTRICT, SIPONGI_2026_LAST_MONTH, HARMONIZED_START_YM, OVERLAP_START, FIRMS_CITATION
P, W = str(INTERIM), str(WEB)

h = pd.read_csv(os.path.join(P, "harmonized_monthly.csv"))
cal = pd.read_csv(os.path.join(P, "calibration.csv"), index_col=0)
val = pd.read_csv(os.path.join(P, "validation.csv"))
pts = pd.read_csv(os.path.join(P, "hotspots_kalbar.csv.gz"), usecols=["acq_date","acq_time"], dtype={"acq_time":str})
last_utc = pd.to_datetime(pts.acq_date.max())
prov = h.groupby(["year","month","ym"], as_index=False)[["Terra","Aqua","N20","naive_sum","harmonized"]].sum(min_count=1)
ov_ym = OVERLAP_START[0]*100 + OVERLAP_START[1]
prov["district"] = PROV; prov["source"] = np.where(prov.ym < ov_ym, "Aqua x ratio", "NOAA-20")
prov.loc[prov.ym < HARMONIZED_START_YM, "source"] = "no Aqua (Terra only)"
h = pd.concat([h, prov], ignore_index=True)
h["partial_month"] = h.ym == PARTIAL_YM
days_cov = min(last_utc.day + 1, 30)  # local time runs ~1 day ahead of last UTC date
frac = days_cov / 30.0

def cls(r, x, mu):
    if np.isnan(r): return None
    if x < 10 and mu < 10: return 0
    return -2 if r < 0.33 else -1 if r < 0.67 else 0 if r <= 1.5 else 1 if r <= 3 else 2 if r <= 6 else 3

out = []
for (dist, mon), g in h.groupby(["district","month"]):
    base = g[g.year.isin(BASE)].set_index("year").harmonized
    for _, row in g.iterrows():
        x = row.harmonized
        ref = base.drop(index=row.year, errors="ignore").dropna()
        mu, med, p90 = ref.mean(), ref.median(), ref.quantile(0.9)
        f = frac if row.partial_month else 1.0
        mu_s = mu * f
        if np.isnan(x):
            r = pct = np.nan
        else:
            r = (x + C) / (mu_s + C)
            pct = (ref * f < x).mean() * 100
        out.append(dict(district=dist, year=int(row.year), month=int(mon), harmonized=None if np.isnan(x) else round(float(x),1),
                        source=row.source, normal_mean=round(mu_s,1), normal_median=round(med*f,1), normal_p90=round(p90*f,1),
                        ratio=None if np.isnan(r) else round(r,2), anomaly_class=cls(r, x if not np.isnan(x) else 0, mu_s),
                        percentile=None if np.isnan(pct) else round(pct), partial=bool(row.partial_month),
                        aqua=int(row.Aqua), terra=int(row.Terra), n20=int(row.N20), naive_sum=int(row.naive_sum)))
a = pd.DataFrame(out).sort_values(["district","year","month"])
a.to_csv(os.path.join(P, "anomaly_monthly.csv"), index=False)

# ---------- SiPongi comparison ----------
sp = pd.read_csv(SIPONGI_DISTRICT)
sp["kabupaten_kota"] = sp.kabupaten_kota.replace({"Kalimantan Barat": PROV})
spl = sp.melt(id_vars=["kode","kabupaten_kota"], var_name="year", value_name="area_ha").rename(columns={"kabupaten_kota":"district"})
spl["year"] = spl.year.astype(int)
hs = a.copy()
hs = hs[(hs.year < 2026) | (hs.month <= SIPONGI_2026_LAST_MONTH)]           # 2026: Jan-Jul to match SiPongi coverage
ann = hs.groupby(["district","year"]).harmonized.sum().reset_index(name="hotspots")
cmp_ = spl.merge(ann, on=["district","year"], how="left")
dd = cmp_[(cmp_.district != PROV) & (cmp_.year <= 2025)].copy()
dd["lh"], dd["la"] = np.log1p(dd.hotspots), np.log1p(dd.area_ha)
b, a0 = np.polyfit(dd.lh, dd.la, 1)
res = dd.la - (a0 + b*dd.lh); sd = res.std()
# District bias = typical burned area per hotspot vs province fit (positive in peat-heavy districts).
dd["resid"] = res
dbias = dd.groupby("district").resid.mean()
within_sd = (dd.resid - dd.district.map(dbias)).std()
cmp_["expected_ha"] = np.expm1(a0 + b*np.log1p(cmp_.hotspots) + cmp_.district.map(dbias).fillna(0))
cmp_["resid_sd"] = (np.log1p(cmp_.area_ha) - np.log1p(cmp_.expected_ha)) / within_sd
cmp_["flag_area_high"] = (cmp_.resid_sd > 1.0) & (cmp_.area_ha > 500)
cmp_.loc[cmp_.district == PROV, ["flag_area_high","resid_sd","expected_ha"]] = [False, np.nan, np.nan]
cmp_["partial_year"] = cmp_.year == 2026
cmp_.round(2).to_csv(os.path.join(P, "sipongi_compare.csv"), index=False)
spear = dd[["hotspots","area_ha"]].corr(method="spearman").iloc[0,1]
provc = cmp_[(cmp_.district==PROV)&(cmp_.year<=2025)]
spear_prov = provc[["hotspots","area_ha"]].corr(method="spearman").iloc[0,1]
pear_prov = np.corrcoef(provc.hotspots, provc.area_ha)[0,1]
per_d = dd.groupby("district").apply(lambda g: np.corrcoef(g.hotspots.rank(), g.area_ha.rank())[0,1], include_groups=False).round(2)

# ---------- Web export ----------
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
dists = sorted(a.district.unique(), key=lambda s: (s != PROV, s))
calendar = {}
for dist in dists:
    g = a[a.district == dist]
    calendar[slug(dist)] = [[int(r.year), int(r.month), r.harmonized, r.normal_mean, r.ratio, r.anomaly_class, r.percentile, r.source, r.partial]
                             for r in g.itertuples()]
normal = {}
for dist in dists:
    g = a[(a.district == dist) & a.year.isin(BASE)]
    mm = g.groupby("month").harmonized.mean()
    peak = [int(k) for k, v in mm.items() if v >= 0.5 * mm.max()]
    normal[slug(dist)] = {"monthly_mean": [round(float(mm[i]),1) for i in range(1,13)], "peak_months": peak}
def ranking(y, mo):
    g = a[(a.year==y)&(a.month==mo)&(a.district!=PROV)].sort_values("ratio", ascending=False)
    return [{"district": r.district, "slug": slug(r.district), "hotspots": r.harmonized, "normal": r.normal_mean, "ratio": r.ratio, "class": r.anomaly_class} for r in g.itertuples()]
vv = val[(val.district!="KALBAR") & (val.actual_n20>=100)]
ape = lambda p: float((np.abs(vv[p]-vv.actual_n20)/vv.actual_n20).median()*100)
meta = {
  "project": "Niskala",
  "region": "West Kalimantan (Kalimantan Barat), Indonesia",
  "generated_local": pd.Timestamp.now(tz="Asia/Jakarta").strftime("%Y-%m-%d %H:%M WIB"),
  "data_through_utc": last_utc.strftime("%Y-%m-%d"),
  "partial_month": {"year": 2026, "month": 11, "days_covered": days_cov},
  "calendar_fields": ["year","month","hotspots_harmonized","normal_mean","ratio_to_normal","anomaly_class","percentile","source","partial"],
  "anomaly_classes": {"-2":"much below normal (<0.33x)","-1":"below normal (0.33-0.67x)","0":"near normal (0.67-1.5x)","1":"above normal (1.5-3x)","2":"well above normal (3-6x)","3":"extreme (>6x)"},
  "baseline_years": [BASE[0], BASE[-1]], "baseline_method": "leave-one-year-out mean per district and calendar month",
  "harmonization": {"reference": "VIIRS NOAA-20 (375 m)", "modis_reference": "MODIS Aqua (1 km)", "overlap": "2018-04 to 2025-12",
                    "formula": "H = Aqua x r_district before 2018-04; H = NOAA-20 from 2018-04", "shrinkage_k": 100,
                    "validation_loyo_median_abs_pct_error": {"district_ratio": round(ape("pred_district_ratio"),1), "single_ratio": round(ape("pred_single_ratio"),1)}},
  "districts": [{"name": dname, "slug": slug(dname), "ratio": (float(cal.loc["KALBAR","ratio"]) if dname==PROV else float(cal.loc[dname,"ratio"])),
                 "raw_ratio": (float(cal.loc["KALBAR","raw_ratio"]) if dname==PROV else float(cal.loc[dname,"raw_ratio"])),
                 **normal[slug(dname)]} for dname in dists],
  "sipongi": {"spearman_district_years_2016_2025": round(float(spear),2), "spearman_province_2016_2025": round(float(spear_prov),2),
              "pearson_province_2016_2025": round(float(pear_prov),2), "per_district_spearman": per_d.to_dict(),
              "fit_log_area_on_log_hotspots": {"slope": round(float(b),3), "intercept": round(float(a0),3), "resid_sd": round(float(sd),3), "within_district_sd": round(float(within_sd),3)},
              "district_area_per_hotspot_bias": dbias.round(2).to_dict()},
  "ranking": {"2026-10": ranking(2026,10), "2026-11": ranking(2026,11), "2026-07": ranking(2026,7)},
  "limitations": ["Hotspots are not burned area; one detection can be part of a large fire.",
                  "Cloud, thick smoke, and smouldering peat fires can be missed by satellites.",
                  "Aug-Nov 2026 uses near-real-time (NRT) data, not yet replaced by standard data.",
                  "Calibration overlap is 2018-2025; the VIIRS/MODIS ratio varies between years (higher in quiet years).",
                  "2001 to June 2002 has Terra only and is not harmonized."],
  "sources": ["NASA LANCE FIRMS (MODIS C6.1, VIIRS NOAA-20 C2)", "SiPongi, Ministry of Forestry (indicative burned area)", "geoBoundaries gbOpen IDN ADM2"],
  "firms_citation": FIRMS_CITATION
}
sip = {}
for dist in dists:
    g = cmp_[cmp_.district == dist]
    sip[slug(dist)] = [{"year": int(r.year), "area_ha": round(float(r.area_ha),1), "hotspots": None if pd.isna(r.hotspots) else round(float(r.hotspots)),
                        "flag_area_high": bool(r.flag_area_high), "partial": bool(r.partial_year)} for r in g.itertuples()]
annual = a.groupby(["district","year"]).agg(harmonized=("harmonized", lambda s: None if s.isna().all() else round(float(s.sum()))),
                                           aqua=("aqua","sum"), terra=("terra","sum"), n20=("n20","sum"), naive_sum=("naive_sum","sum")).reset_index()
annual_j = {slug(dd_): g.drop(columns="district").to_dict(orient="records") for dd_, g in annual.groupby("district")}
def clean(o):
    if isinstance(o, dict): return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return [clean(v) for v in o]
    if hasattr(o, "item"): o = o.item()
    if isinstance(o, float) and (np.isnan(o) or np.isinf(o)): return None
    return o
for name, obj in [("meta", meta), ("calendar", calendar), ("sipongi", sip), ("annual", annual_j)]:
    with open(os.path.join(W, f"{name}.json"), "w") as f: json.dump(clean(obj), f, separators=(",", ":"), allow_nan=False)

# ---------- Print key checks ----------
pd.set_option("display.width", 170)
k = a[(a.district==PROV)&(a.year.isin([2015,2019,2023,2026]))&(a.month.isin([6,7,8,9,10,11]))][["year","month","harmonized","normal_mean","ratio","anomaly_class","percentile"]]
print(k.to_string(index=False))
print("\nSiPongi spearman district-years:", round(spear,2), "| province:", round(spear_prov,2), "| per district:", per_d.to_dict())
print("District bias (log area per hotspot, + = more area than hotspots suggest):", dbias.round(2).sort_values().to_dict()); print("Flags (area high vs own district pattern):"); print(cmp_[cmp_.flag_area_high][["district","year","area_ha","hotspots","expected_ha","resid_sd"]].round(1).to_string(index=False))
print("\nRanking Jul 2026:", [(r["district"], r["ratio"]) for r in meta["ranking"]["2026-07"][:5]])
print("Normal peak months (Kalbar):", normal[slug(PROV)]["peak_months"])
for f in sorted(os.listdir(W)): print(f, os.path.getsize(os.path.join(W,f)), "bytes")
