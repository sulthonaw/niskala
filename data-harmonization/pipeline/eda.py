"""Exploratory data analysis for the forecasting step (run after steps 1-3).

Questions: distribution (zeros, skew, overdispersion), seasonality, interannual variability,
ENSO lead/lag relationship, autocorrelation after removing seasonality, and co-movement of districts.
Outputs: outputs/figures/eda_*.png, data/interim/eda_summary.json
Written with help from Claude (AI).
"""
import json, numpy as np, pandas as pd, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from config import INTERIM, FIGURES, ENSO, ENSO_MISSING, HARMONIZED_START_YM, FORECAST_LAST_COMPLETE_YM, PROVINCE

BLUE, ORANGE, AQUA, GRAY, TXT2, GRID = "#2a78d6", "#eb6834", "#1baf7a", "#898781", "#52514e", "#e4e3df"
plt.rcParams.update({"font.size": 10, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True,
                     "grid.color": GRID, "grid.linewidth": 0.7, "axes.axisbelow": True})
MON = ["J","F","M","A","M","J","J","A","S","O","N","D"]

h = pd.read_csv(INTERIM / "harmonized_monthly.csv")
h = h[(h.ym >= HARMONIZED_START_YM) & (h.ym <= FORECAST_LAST_COMPLETE_YM)].copy()
P = h.pivot(index="ym", columns="district", values="harmonized")
P[PROVINCE] = P.sum(axis=1)
yy, mm = P.index // 100, P.index % 100
districts = [c for c in P.columns if c != PROVINCE]

rows = []
for line in open(ENSO):
    p = line.split()
    if len(p) == 13 and p[0].isdigit():
        rows += [(int(p[0]) * 100 + k, float(v)) for k, v in enumerate(p[1:], 1)]
enso = pd.Series(dict(rows)).replace(ENSO_MISSING, np.nan)
S = {}

# 1. Distribution
dist = []
for c in P.columns:
    x = P[c]
    dist.append(dict(district=c, months=len(x), zero_pct=round(float((x == 0).mean() * 100), 1), mean=round(float(x.mean()), 1),
                     median=float(x.median()), p95=round(float(x.quantile(.95)), 1), max=float(x.max()),
                     var_to_mean=round(float(x.var() / x.mean()), 1), skew=round(float(x.skew()), 2),
                     skew_log1p=round(float(np.log1p(x).skew()), 2)))
S["distribution"] = dist
fig, ax = plt.subplots(1, 2, figsize=(11, 3.8), dpi=150)
x = P[PROVINCE]
ax[0].hist(x, bins=60, color=BLUE); ax[0].set_title("Province monthly hotspots (raw)"); ax[0].set_xlabel("hotspots / month")
ax[1].hist(np.log1p(P[districts].to_numpy().ravel()), bins=50, color=BLUE); ax[1].set_title("All district-months, log1p scale"); ax[1].set_xlabel("log1p(hotspots)")
fig.tight_layout(); fig.savefig(FIGURES / "eda_1_distribution.png"); plt.close(fig)

# 2. Seasonality
L = np.log1p(P)
fig, axs = plt.subplots(3, 5, figsize=(14, 7.5), dpi=150, sharex=True)
peak = {}
for a, c in zip(axs.ravel(), [PROVINCE] + districts):
    g = P[c].groupby(mm)
    a.fill_between(range(1, 13), g.quantile(.25), g.quantile(.75), color=BLUE, alpha=.2, lw=0)
    a.plot(range(1, 13), g.median(), color=BLUE, lw=2); a.set_title(c, fontsize=9)
    a.set_xticks(range(1, 13)); a.set_xticklabels(MON, fontsize=7)
    pk = P[c].groupby(yy).apply(lambda s: int(s.index[s.values.argmax()] % 100) if s.max() > 0 else np.nan).dropna()
    peak[c] = {"modal_peak_month": int(pk.mode().iloc[0]), "share_peak_in_aug_sep_pct": round(float(pk.isin([8, 9]).mean() * 100))}
fig.suptitle("Seasonality: median (line) and interquartile range (band) by calendar month, 2002-2026", x=0.01, ha="left")
fig.tight_layout(); fig.savefig(FIGURES / "eda_2_seasonality.png"); plt.close(fig)
S["seasonality_peak"] = peak

# 3. Interannual
ann = P[PROVINCE].groupby(yy).sum(); fs = P[PROVINCE][mm.isin([7, 8, 9, 10])].groupby(yy[mm.isin([7, 8, 9, 10])]).sum()
S["interannual"] = {"fire_season_total_min": float(fs.min()), "fire_season_total_max": float(fs.max()),
                    "max_to_min_ratio": round(float(fs.max() / max(fs.min(), 1)), 1),
                    "share_of_year_in_jul_oct_pct": round(float(fs.sum() / ann.loc[fs.index].sum() * 100), 1),
                    "top5_years": fs.sort_values(ascending=False).head(5).round().to_dict()}

# 4. ENSO relationship
fsl = np.log1p(fs)
lead = {}
for name, mons in {"Jan-Mar": [1,2,3], "Mar-May": [3,4,5], "Apr-Jun": [4,5,6], "May-Jul": [5,6,7], "Jun-Aug": [6,7,8], "Jul-Sep": [7,8,9]}.items():
    e = pd.Series({y: enso[[y * 100 + m for m in mons]].mean() for y in fsl.index})
    lead[name] = round(float(np.corrcoef(e, fsl)[0, 1]), 2)
S["enso_vs_fireseason_log_corr"] = lead
clim = L.groupby(mm).transform("mean"); anom = (L - clim)[PROVINCE]
lag = {}
for k in range(0, 7):
    e = enso.reindex([int(((ym // 100) * 12 + ym % 100 - 1 - k) // 12 * 100 + ((ym // 100) * 12 + ym % 100 - 1 - k) % 12 + 1) for ym in anom.index]).to_numpy()
    ok = ~np.isnan(e); lag[k] = round(float(np.corrcoef(e[ok], anom.to_numpy()[ok])[0, 1]), 2)
S["enso_lag_corr_monthly_anomaly"] = lag
season_anom = anom[mm.isin([7, 8, 9, 10])]
lag_fs = {}
for k in range(0, 7):
    e = enso.reindex([int(((ym // 100) * 12 + ym % 100 - 1 - k) // 12 * 100 + ((ym // 100) * 12 + ym % 100 - 1 - k) % 12 + 1) for ym in season_anom.index]).to_numpy()
    lag_fs[k] = round(float(np.corrcoef(e, season_anom.to_numpy())[0, 1]), 2)
S["enso_lag_corr_fire_season_months"] = lag_fs
fig, ax = plt.subplots(1, 2, figsize=(11, 3.8), dpi=150)
e = pd.Series({y: enso[[y * 100 + m for m in [5, 6, 7]]].mean() for y in fsl.index})
ax[0].scatter(e, fs / 1000, color=ORANGE, s=28, zorder=3)
for y in fs.index:
    if fs[y] > fs.quantile(.75) or y in (2010, 2026): ax[0].annotate(str(y), (e[y], fs[y] / 1000), fontsize=8, color=TXT2, xytext=(3, 3), textcoords="offset points")
ax[0].set_xlabel("Nino 3.4 anomaly, May-Jul mean (degC)"); ax[0].set_ylabel("Jul-Oct hotspots (thousands)")
ax[0].set_title(f"ENSO before the season vs season total (r on log = {lead['May-Jul']})")
ax[1].bar(list(lag_fs), list(lag_fs.values()), color=BLUE, width=.6); ax[1].bar(list(lag), list(lag.values()), color=GRAY, width=.25)
ax[1].set_xlabel("ENSO lead (months)"); ax[1].set_ylabel("correlation"); ax[1].set_title("ENSO lead vs monthly anomaly\n(blue: Jul-Oct months, gray: all months)")
fig.tight_layout(); fig.savefig(FIGURES / "eda_3_enso.png"); plt.close(fig)

# 5. Autocorrelation of de-seasonalised log anomaly (province and pooled districts)
def acf(s, k): s = s - s.mean(); return float((s[k:] * s[:-k]).sum() / (s * s).sum())
an_d = (L - clim)[districts]
S["acf_province"] = {k: round(acf(anom.to_numpy(), k), 2) for k in (1, 2, 3, 6, 12)}
S["acf_districts_mean"] = {k: round(float(np.mean([acf(an_d[c].to_numpy(), k) for c in districts])), 2) for k in (1, 2, 3, 6, 12)}

# 6. District co-movement (annual totals, log)
A = np.log1p(P[districts].groupby(yy).sum())
C = A.corr()
S["district_annual_corr_mean_offdiag"] = round(float((C.to_numpy().sum() - len(C)) / (len(C) ** 2 - len(C))), 2)
fig, ax = plt.subplots(figsize=(7.5, 6.5), dpi=150)
im = ax.imshow(C, cmap="Blues", vmin=0, vmax=1); ax.grid(False)
ax.set_xticks(range(len(C))); ax.set_xticklabels(C.columns, rotation=90, fontsize=8); ax.set_yticks(range(len(C))); ax.set_yticklabels(C.columns, fontsize=8)
for i in range(len(C)):
    for j in range(len(C)): ax.text(j, i, f"{C.iloc[i, j]:.1f}", ha="center", va="center", fontsize=6.5, color="white" if C.iloc[i, j] > .6 else "#0b0b0b")
ax.set_title("Correlation of annual totals between districts (log)"); fig.colorbar(im, shrink=.7)
fig.tight_layout(); fig.savefig(FIGURES / "eda_4_district_corr.png"); plt.close(fig)

json.dump(S, open(INTERIM / "eda_summary.json", "w"), indent=1, default=str)
print(pd.DataFrame(dist).to_string(index=False))
for k, v in S.items():
    if k != "distribution": print(k, ":", v)
