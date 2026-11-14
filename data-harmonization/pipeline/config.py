"""Shared paths and constants for the Niskala data-harmonization pipeline.

Every step imports from here, so folder layout and method parameters live in one place.
Written with help from Claude (AI); method decisions and verification by the Niskala team.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

# Raw inputs
RAW = DATA / "raw"
FIRMS_YEARLY = RAW / "firms" / "indonesia-yearly"          # FIRMS yearly country files (Indonesia)
FIRMS_2026_ZIPS = RAW / "firms" / "kalbar-2026"            # FIRMS Archive Download zips (custom box)
FIRMS_2026_EXTRACTED = FIRMS_2026_ZIPS / "extracted"       # created by step 1
SIPONGI_DISTRICT = RAW / "sipongi" / "sipongi_luas_kebakaran_kalbar_kabupaten_2016_2026.csv"
ENSO = RAW / "enso" / "nina34.anom.data.txt"
BOUNDARIES = RAW / "boundaries" / "geoBoundaries-IDN-ADM2_simplified.geojson"

# Outputs
INTERIM = DATA / "interim"     # intermediate tables (CSV)
WEB = DATA / "web"             # files consumed by the React frontend (copy to frontend/public/data)
FIGURES = ROOT / "outputs" / "figures"
for p in (INTERIM, WEB, FIGURES):
    p.mkdir(parents=True, exist_ok=True)

# Region
BBOX = (108.0, -3.1, 114.2, 2.1)   # West, South, East, North
PROVINCE = "Kalimantan Barat"
DISTRICTS = ["Bengkayang", "Kapuas Hulu", "Kayong Utara", "Ketapang", "Kota Pontianak", "Kota Singkawang",
             "Kubu Raya", "Landak", "Melawi", "Mempawah", "Sambas", "Sanggau", "Sekadau", "Sintang"]
LOCAL_UTC_OFFSET_H = 7             # WIB

# Filters
MODIS_MIN_CONFIDENCE = 30          # MODIS numeric confidence
VIIRS_DROP_CONFIDENCE = "l"        # VIIRS 'low'

# Harmonization
OVERLAP_START = (2018, 4)          # NOAA-20 first full month
OVERLAP_END = (2025, 12)
SHRINKAGE_K = 100.0                # pseudo-count of Aqua detections pulling small districts to the province ratio
VALIDATION_YEARS = range(2019, 2026)
HARMONIZED_START_YM = 200207       # Aqua starts 2002-07-04

# Baseline and anomaly
BASELINE_YEARS = list(range(2003, 2026))
ANOMALY_C = 5.0                    # stabiliser in (H + C) / (normal + C)
PARTIAL_YM = 202611                # current month, not complete
SIPONGI_2026_LAST_MONTH = 7        # SiPongi 2026 covers Jan-Jul

FIRMS_CITATION = ("We acknowledge the use of data and imagery from LANCE FIRMS (https://earthdata.nasa.gov/firms), "
                  "part of the NASA Earth Science Data and Information System (ESDIS).")

# Forecast (step 6)
ENSO_MISSING = -99.99
FORECAST_WINDOW = 12               # months of history fed to the LSTM
FORECAST_LAST_COMPLETE_YM = 202610 # last complete month used for training
FORECAST_TARGET_YM = 202611        # month being forecast (in progress)
FORECAST_SEEDS = [0, 1, 2]
FORECAST_HIDDEN = 16
FIRE_SEASON_MONTHS = [7, 8, 9, 10]

# Forecast v2 (after EDA)
SPARSE_DISTRICTS = ["Kota Pontianak", "Kota Singkawang"]   # too many zero months; province total only
DRY_MONTHS = [6, 7, 8, 9, 10]
LSTM_WINDOW = 3
LSTM_HIDDEN = 8
LSTM_L2 = 1e-3
ABOVE_NORMAL_RATIO = 1.5           # same threshold as anomaly class >= 1
