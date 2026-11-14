# EDA for Forecasting – Findings and Preprocessing Decisions

Data: harmonized monthly hotspots (NOAA-20 equivalent), 14 districts + province, 2002-07 to 2026-10 (292 months), and the Niño 3.4 anomaly. Script: `pipeline/eda.py`. Figures: `outputs/figures/eda_*.png`. Numbers: `data/interim/eda_summary.json`.

## 1. Distribution – heavy-tailed, overdispersed counts with many zeros
* Variance is 460–6,900 times the mean (Kota Pontianak 15×). Raw skewness 3.5–6.4; after `log1p` it drops to about 0–1.
* Share of zero months: 5% (Ketapang) to 41% (Sekadau); **Kota Pontianak 78%** and **Kota Singkawang 57%**, with monthly means of 1.6 and 7.
* **Decision:** model counts with a Negative Binomial likelihood, or work on `log1p`. Do not fit Pontianak and Singkawang as separate series; keep them in the province total only.

## 2. Seasonality – very strong and stable
* July–October holds **91%** of all hotspots in a year.
* The peak month falls in August or September in 84–100% of years for most districts. Coastal peat districts (Kubu Raya, Sambas, Mempawah) also show a small February–March bump and a less regular peak (52–68%).
* **Decision:** include a calendar-month effect per district. Report skill separately for July–October, where decisions matter.

## 3. Interannual variability – the real signal
* Fire-season totals range from about 8,400 to 76,700 detections (**9× apart**). Top years: 2006, 2026, 2002, 2009, 2004.
* **Decision:** a seasonal mean alone cannot capture this; the model needs drivers that change year to year.

## 4. ENSO – useful, but only close to the season
* Correlation between the Niño 3.4 average and the (log) July–October total: Jan–Mar −0.13, Mar–May 0.12, Apr–Jun 0.38, **May–Jul 0.56, Jun–Aug 0.66**, Jul–Sep 0.71.
* For fire-season months, ENSO leading by 0–2 months correlates 0.42–0.49 with the monthly anomaly; by 3 months it drops to 0.23 and then to about zero.
* Some severe years (2002, 2006, 2009) had only moderate ENSO, so other drivers matter too.
* **Decision:** use observed ENSO at lags 1–2 months. Forecasts more than ~2 months ahead would need ENSO forecasts and are out of scope.

## 5. Memory – short
* Autocorrelation of the de-seasonalized log anomaly: lag 1 = 0.31 (province) / 0.23 (district mean), lag 2 ≈ 0.2, lag 3 ≈ 0.06, then ≈ 0.
* **Decision:** one or two lagged anomalies are enough. A 12-month input window adds noise, which helps explain the LSTM overfitting.

## 6. Districts move together
* Mean correlation of annual totals between districts: **0.66**.
* **Decision:** one pooled model with shared ENSO and lag effects and district-specific seasonality/intercepts.

## Resulting preprocessing and modeling plan
| Item | Choice |
|:---|:---|
| Target | Monthly harmonized count (rounded) for NB; `log1p` for comparison models |
| Series | 12 districts modeled; Pontianak and Singkawang only inside the province total |
| Features | District × calendar month, Niño 3.4 at lags 1–2, log anomaly at lags 1–2 |
| Horizon | 1 month ahead |
| Splits | Train ≤ 2020 / test 2021–2025; train ≤ 2025 / test Jan–Oct 2026 (unchanged) |
| Metrics | MAE and log-MAE overall and for Jul–Oct; province total; probability of "above normal" |
| Models | Climatology, persistence, Negative Binomial regression (main), LSTM with a short window (experimental) |
