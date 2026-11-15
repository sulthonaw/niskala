# Niskala – Data Harmonization

This folder turns NASA FIRMS active-fire hotspots from two different sensors (MODIS and VIIRS) into one consistent monthly record for West Kalimantan, Indonesia (2002–2026). Built for **NASA Space Apps Challenge 2026**, Challenge #9: Harmonization of MODIS and VIIRS Hot Spots.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-2-150458?logo=pandas&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-1.24+-013243?logo=numpy&logoColor=white)
![statsmodels](https://img.shields.io/badge/statsmodels-0.14-4B8BBE)
![SciPy](https://img.shields.io/badge/SciPy-1.10+-8CAAE6?logo=scipy&logoColor=white)
![Shapely](https://img.shields.io/badge/Shapely-2-6E9F18)
![Jupyter](https://img.shields.io/badge/Jupyter-notebooks-F37626?logo=jupyter&logoColor=white)

> **This pipeline feeds the Niskala web app.** Its output (`data/web/`) is copied to [`../frontend/public/data/`](../frontend), where the calendar, district ranking and downloads read it. The web app does no data processing of its own.

## Why harmonize?

MODIS (1 km, since 2000) is retiring. VIIRS (375 m, NOAA-20 since 2018) sees many more small fires. Adding the two together creates a false jump when VIIRS arrives: in the simple merge, the 2015 El Niño year shows fewer detections than 2018. Niskala calibrates MODIS to VIIRS per district so the whole record is comparable.

![Simple merge vs harmonized](outputs/figures/chart_naive_vs_harmonized.png)

## Quick start

Large FIRMS files are not stored in this repository. Get them in one of two ways before the first run.

**Option 1: ready-to-use folder (recommended).** Download the full `data/` folder and place it at `data-harmonization/data/`:

**Dataset download:** [Google Drive – Niskala data folder](https://drive.google.com/drive/folders/1vVRL2DjfHPPPLKBycCkpsSU2h3lpXxCe?usp=sharing)

**Option 2: download from the original sources.**

| Data | Source | What to download | Save to |
|:---|:---|:---|:---|
| NASA FIRMS yearly files (2001–2025) | [FIRMS Yearly Country Data](https://firms.modaps.eosdis.nasa.gov/country/) | Country **Indonesia**: MODIS C6.1 for 2001–2025 (`modis_<year>_Indonesia.csv`) and VIIRS NOAA-20 for 2018–2025 (`viirs-jpss1_<year>_Indonesia.csv`) | `data/raw/firms/indonesia-yearly/` |
| NASA FIRMS 2026 | [FIRMS Archive Download](https://firms.modaps.eosdis.nasa.gov/download/) (free NASA Earthdata login) | Custom area `108.0,-3.1,114.2,2.1` (W, S, E, N), 1 Jan 2026 to the latest date, CSV, sources MODIS C6.1, VIIRS NOAA-20 and VIIRS S-NPP | `data/raw/firms/kalbar-2026/` (zip files; already in the repo) |
| SiPongi burned area | [SiPongi – Indikasi Luas Kebakaran](https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran) (Ministry of Forestry, Indonesia) | Indicative burned area in hectares: tab *List Data Kabupaten/Kota* for West Kalimantan 2016–2026, and province totals 2015–2026. The site shows tables, so the values were copied into CSV files | `data/raw/sipongi/` (already in the repo) |

The district boundaries (geoBoundaries) and the Niño 3.4 file (NOAA PSL) are small and already in `data/raw/`.

```bash
pip install -r requirements.txt
python run_pipeline.py          # all steps (about 3 minutes)
python run_pipeline.py 2 3      # selected steps only
```

Copy `data/web/` to `frontend/public/data/` after running.

To explore the data, open `notebooks/eda.ipynb` after steps 1–3 (summary in [`EDA.md`](EDA.md)). The model comparison is in `notebooks/modeling.ipynb`.

## Folder layout

```
data-harmonization/
├── run_pipeline.py          runs the steps in order
├── requirements.txt
├── EDA.md               EDA findings and preprocessing decisions
├── notebooks/
│   ├── eda.ipynb        exploratory data analysis
│   └── modeling.ipynb   preprocessing, model comparison, forecast
├── pipeline/
│   ├── config.py            all paths and method parameters
│   ├── step1_prepare_hotspots.py
│   ├── step2_harmonize.py
│   ├── step3_anomaly_sipongi_export.py
│   ├── step4_export_points.py
│   ├── step5_chart.py
│   ├── step6_forecast.py    next-month forecast and export
│   ├── step7_district_map.py district outlines for the web map
│   ├── forecast_lib.py      preprocessing + models (climatology, persistence, Negative Binomial, LSTM)
│   ├── learning_curves.py   LSTM learning-curve diagnostic
│   ├── lstm_numpy.py        small LSTM in pure numpy (no PyTorch needed)
│   └── eda.py               script version of the EDA
├── data/
│   ├── raw/                 inputs (see "Data sources")
│   ├── interim/             intermediate tables
│   └── web/                 files used by the frontend
└── outputs/figures/
```

## Pipeline

| Step | What it does | Main outputs |
|:---|:---|:---|
| 1 | Merges FIRMS yearly files and the 2026 archive download, keeps the West Kalimantan box, vegetation fires only (`type = 0`; NRT points on known static heat sources removed), MODIS confidence ≥ 30 and VIIRS not `low`, then assigns each point to one of 14 districts | `interim/hotspots_kalbar.csv.gz` |
| 2 | Counts per month in local time (WIB). Calibrates Aqua MODIS to NOAA-20 VIIRS per district over the 2018-04 to 2025-12 overlap, with shrinkage toward the province ratio for small districts. Leave-one-year-out validation | `interim/harmonized_monthly.csv`, `calibration.csv`, `validation.csv` |
| 3 | Monthly baseline (2003–2025, leave-one-year-out) and anomaly classes; comparison with SiPongi burned area; JSON export | `web/meta.json`, `calendar.json`, `sipongi.json`, `annual.json` |
| 4 | Per-district, per-year hotspot CSV files for the download button | `web/points/<district>/<year>.csv` |
| 5 | Slide chart | `outputs/figures/chart_naive_vs_harmonized.png` |
| 6 | One-month-ahead forecast per district: climatology, persistence, **Negative Binomial regression (main)**, and a small LSTM (experimental). Features from the EDA: normal level, last 1–2 months' anomaly, Niño 3.4 (lag 1) in the dry season. Leakage-free tests: train ≤ 2020 → test 2021–2025; train ≤ 2025 → test Jan–Oct 2026 | `web/forecast.json`, `interim/forecast_scores.csv`, `interim/forecast_backtest.csv` |
| 7 | Simplified outlines of the 14 districts, projected to SVG paths for the web map | `web/map.json` |

## Method in brief

* **Reference sensor:** VIIRS NOAA-20 (still operating). **MODIS reference:** Aqua. Terra is excluded because of orbit drift; January 2001 to June 2002 has Terra only and is not harmonized.
* **Calibration:** `r_d = (N20_d + k·R) / (Aqua_d + k)`, k = 100, R = province ratio. Harmonized `H = Aqua × r_d` before April 2018, `H = NOAA-20` after.
* **Anomaly:** `(H + 5) / (normal + 5)` against the same calendar month in 2003–2025, excluding the year being judged. Classes: < 0.33×, 0.33–0.67×, 0.67–1.5×, 1.5–3×, 3–6×, > 6×.

## Key results

| Check | Result |
|:---|:---|
| NOAA-20 / Aqua ratio, West Kalimantan | 5.28 (district range 3.8–8.5) |
| Leave-one-year-out error, district-year (median) | 19.6% with district ratios vs 27.6% with one ratio |
| Intensity-dependent log-log model (tested, not used) | 32.0% |
| Harmonized hotspots vs SiPongi burned area, province 2016–2025 | Spearman 0.90 |
| Normal peak months, West Kalimantan | August–September |
| Ketapang, October 2026 | 8.1× normal |
| Kayong Utara, July 2026 (province only 1.4×) | 8.3× normal |
| Forecast test 2021–2025, MAE per district-month | NB 87 vs climatology 132 vs persistence 132 vs LSTM 148 |
| Forecast test 2021–2025, Brier (above normal) | NB 0.135 vs climatology 0.148 |
| NB 10–90% range, share of actual values inside | 92% (2021–2025), 82% (2026) |
| Extreme 2026 season | All models under-predict the peak; NB gives the highest above-normal probabilities |

## Limitations

* Hotspots are not burned area; one detection can belong to a large fire.
* Cloud, thick smoke, and smouldering peat fires can be missed by satellites.
* August–November 2026 is near-real-time (NRT) data; November 2026 is incomplete.
* The VIIRS/MODIS ratio varies between years (higher in quiet years); calibration overlap is 2018–2025.

## Data sources

* **NASA LANCE FIRMS** – MODIS C6.1 (Terra, Aqua), VIIRS C2 (NOAA-20, Suomi NPP). Yearly country files (Indonesia, 2001–2025) and Archive Download for 2026 (box W 108.0, S −3.1, E 114.2, N 2.1). https://firms.modaps.eosdis.nasa.gov
  *We acknowledge the use of data and imagery from LANCE FIRMS (https://earthdata.nasa.gov/firms), part of the NASA Earth Science Data and Information System (ESDIS).*
* **SiPongi, Ministry of Forestry, Indonesia** – indicative burned area per district, 2016–2026. https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran
* **geoBoundaries gbOpen** – IDN ADM2 district boundaries (CC BY 4.0). https://www.geoboundaries.org
* **NOAA PSL** – Niño 3.4 anomaly (ERSST v6), used as a forecast input. https://psl.noaa.gov/data/timeseries/month/DS/NINO34/

## Use of AI

AI (Claude, by Anthropic) was used to help write the code and notebooks. The problem framing, choice of data, harmonization method, model choices, and pipeline structure came from the team. We worked human-in-the-loop: the team directed each step, reviewed the generated code, and checked every result against the data (for example, the leave-one-year-out test and the SiPongi comparison) before accepting it.
