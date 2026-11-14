"""Step 5 - Slide chart: simple merge vs harmonized annual hotspots (West Kalimantan).

Outputs: outputs/figures/chart_naive_vs_harmonized.png and .svg
Written with help from Claude (AI).
"""
import os, pandas as pd, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from config import INTERIM, FIGURES
OUT = str(FIGURES)
h = pd.read_csv(INTERIM / "harmonized_monthly.csv")
a = h.groupby("year")[["Aqua","Terra","N20","naive_sum","harmonized"]].sum()
a = a.loc[2003:2026]
BLUE, ORANGE, GRAY = "#2a78d6", "#eb6834", "#898781"
TXT, TXT2, GRID, SURF = "#0b0b0b", "#52514e", "#e4e3df", "#fcfcfb"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 12})
fig, ax = plt.subplots(figsize=(12, 6.2), dpi=200); fig.patch.set_facecolor(SURF); ax.set_facecolor(SURF)
yrs = a.index.values
full = yrs < 2026
ax.plot(yrs[full], a.naive_sum[full]/1000, color=ORANGE, lw=2.2, marker="o", ms=5, zorder=3, label="Simple merge (MODIS + VIIRS added up)")
ax.plot(yrs[full], a.harmonized[full]/1000, color=BLUE, lw=2.6, marker="o", ms=5, zorder=4, label="Harmonized by Niskala (NOAA-20 equivalent)")
ax.axvspan(2017.5, 2018.5, color="#f0efec", zorder=0)
ax.text(2018, 93, "NOAA-20 VIIRS\njoins (Apr 2018)", ha="center", va="top", color=TXT2, fontsize=10.5)
ax.set_xlim(2002.5, 2025.8); ax.set_ylim(0, 95)
ax.set_xticks(range(2003, 2026, 2))
ax.set_ylabel("Hotspot detections per year (thousands)", color=TXT2)
for s_ in ["top","right","left"]: ax.spines[s_].set_visible(False)
ax.spines["bottom"].set_color(GRID); ax.tick_params(colors=TXT2, length=0)
ax.yaxis.grid(True, color=GRID, lw=0.8); ax.set_axisbelow(True)
leg = ax.legend(loc="upper right", bbox_to_anchor=(1.0, 0.86), frameon=False, fontsize=11, labelcolor=TXT, handlelength=2.2)
ax.annotate("2015 (El Niño) shows only 13k detections in the simple merge,\nfewer than 2018's 34k. Harmonized: 52k vs 29k.", (2015, a.naive_sum.loc[2015]/1000),
            xytext=(2010.6, 86), color=TXT2, fontsize=10, ha="left", va="top", arrowprops=dict(arrowstyle="-", color=TXT2, lw=0.8))
fig.text(0.07, 0.965, "Adding MODIS and VIIRS together creates a false jump in 2018", fontsize=16, color=TXT, weight="bold", ha="left")
fig.text(0.07, 0.925, "West Kalimantan, annual vegetation-fire hotspots, 2003–2025. Harmonized = Aqua MODIS × district ratio before Apr 2018, NOAA-20 after.", fontsize=10.5, color=TXT2, ha="left")
fig.text(0.07, 0.02, "Data: NASA LANCE FIRMS (MODIS C6.1, VIIRS NOAA-20 C2). Processing: Niskala team. Chart built with AI assistance (Claude).", fontsize=9, color=TXT2, ha="left")
fig.subplots_adjust(left=0.07, right=0.97, top=0.86, bottom=0.1)
for ext in ["png","svg"]: fig.savefig(os.path.join(OUT, f"chart_naive_vs_harmonized.{ext}"), facecolor=SURF)
print(a[["naive_sum","harmonized"]].loc[[2015,2017,2018,2019,2025]].round(0))
