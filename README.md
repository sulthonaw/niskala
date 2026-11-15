# Niskala

**A harmonized hotspot calendar for fire agencies in West Kalimantan, Indonesia.**

Submission for **NASA Space Apps Challenge 2026**, Challenge #9: [Harmonization of MODIS and VIIRS Hot Spots](https://www.spaceappschallenge.org/2026/challenges/modis-and-viirs-hot-spots/).

![NASA FIRMS](https://img.shields.io/badge/Data-NASA%20FIRMS-0B3D91)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)

---

## What is Niskala?

Satellites have recorded fire hotspots in Indonesia for more than 20 years, but the record comes from two sensors that count differently. MODIS (1 km pixels, since 2000) sees fewer fires than VIIRS (375 m pixels, since 2012). When the two are simply added together, fire counts appear to jump after VIIRS arrives, even though nothing changed on the ground. As a result, nobody can say with confidence whether this month is normal or not.

Niskala fixes that in three steps:

1. **Harmonize.** Older MODIS counts are converted to the VIIRS NOAA-20 scale, with a separate conversion factor for each district.
2. **Compare with normal.** Each month is compared with the same month in 2003–2025 for the same district.
3. **Show it simply.** A web calendar colors every month from "much below normal" to "extreme", and answers three questions for disaster agencies (BPBD): *when* the season usually peaks, *how bad* this month is, and *where* it is most unusual.

Results are checked against official SiPongi burned-area records (rank correlation 0.90 for the province, 2016–2025).

**Example:** in July 2026 the province looked close to normal (1.4×), but Kayong Utara was already at 8.3× its normal. A province total would have hidden that warning.

## Team

**Kata Mama Dulu Aku Pengen Jadi Astronot**

## Repository structure

```
niskala/
├── data-harmonization/   Python pipeline: raw FIRMS data → harmonized monthly record → JSON
└── frontend/             React web app that reads the JSON and shows the calendar
```

The two parts are linked: the pipeline writes `data-harmonization/data/web/`, and the frontend reads a copy of it from `frontend/public/data/`.

| Part | What it contains | Guide |
|:---|:---|:---|
| `data-harmonization/` | Data cleaning, harmonization, baseline and anomaly, SiPongi check, forecast, notebooks | [data-harmonization/README.md](data-harmonization/README.md) |
| `frontend/` | Landing page, anomaly calendar, CSV and report download, documentation | [frontend/README.md](frontend/README.md) |

## Dataset

Large data files are not stored in this repository (see `.gitignore`). There are two ways to get them.

**Option 1: ready-to-use folder (recommended).** Download the full `data-harmonization/data/` folder, raw files included, and place it at `data-harmonization/data/`:

**Dataset download:** [Google Drive – Niskala data folder](https://drive.google.com/drive/folders/1vVRL2DjfHPPPLKBycCkpsSU2h3lpXxCe?usp=sharing)

**Option 2: download from the original sources.** Paths below are inside `data-harmonization/`.

| Data | Source | What to download | Save to |
|:---|:---|:---|:---|
| NASA FIRMS yearly files (2001–2025) | [FIRMS Yearly Country Data](https://firms.modaps.eosdis.nasa.gov/country/) | Country **Indonesia**: MODIS C6.1 for 2001–2025 (`modis_<year>_Indonesia.csv`) and VIIRS NOAA-20 for 2018–2025 (`viirs-jpss1_<year>_Indonesia.csv`) | `data/raw/firms/indonesia-yearly/` |
| NASA FIRMS 2026 | [FIRMS Archive Download](https://firms.modaps.eosdis.nasa.gov/download/) (free NASA Earthdata login) | Custom area `108.0,-3.1,114.2,2.1` (W, S, E, N), 1 Jan 2026 to the latest date, CSV, sources MODIS C6.1, VIIRS NOAA-20 and VIIRS S-NPP | `data/raw/firms/kalbar-2026/` (zip files; already in the repo) |
| SiPongi burned area | [SiPongi – Indikasi Luas Kebakaran](https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran) (Ministry of Forestry, Indonesia) | Indicative burned area in hectares: tab *List Data Kabupaten/Kota* for West Kalimantan 2016–2026, and province totals 2015–2026. The site shows tables, so the values were copied into CSV files | `data/raw/sipongi/` (already in the repo) |

The district boundaries (geoBoundaries) and the Niño 3.4 file (NOAA PSL) are small and already in `data/raw/`.

Then run the pipeline (see the [data-harmonization guide](data-harmonization/README.md)).

## Quick start

```bash
# 1. Data (optional: processed JSON is already in frontend/public/data)
cd data-harmonization
pip install -r requirements.txt
python run_pipeline.py

# 2. Web app
cd ../frontend
bun install
bun run dev
```

## Data sources

* **NASA LANCE FIRMS**: MODIS C6.1 and VIIRS C2 active fire data. https://www.earthdata.nasa.gov/data/tools/firms
* **SiPongi** (Ministry of Forestry, Indonesia): indicative burned area. https://sipongi.gakkum.kehutanan.go.id/indikasi-luas-kebakaran
* **geoBoundaries**: district boundaries (IDN ADM2). https://www.geoboundaries.org
* **NOAA PSL**: Niño 3.4 anomaly. https://psl.noaa.gov/data/timeseries/month/DS/NINO34/

*We acknowledge the use of data and imagery from LANCE FIRMS (https://earthdata.nasa.gov/firms), part of the NASA Earth Science Data and Information System (ESDIS).*

## Use of AI

AI (Claude, by Anthropic) was used to help write code and to tidy documentation. The problem framing, solution idea, project structure, method choices, and final decisions came from the team. We worked human-in-the-loop: the team directed every step, reviewed the generated code, and checked the results against the data before accepting them.
