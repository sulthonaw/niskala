"""Step 6 - Next-month forecast: climatology vs persistence vs Negative Binomial vs LSTM.

Preprocessing and models live in forecast_lib.py (decisions from EDA.md).
Stage A: train <= 2020, test 2021-2025.  Stage B: train <= 2025, test Jan-Oct 2026.
Stage C: train through Oct 2026, forecast Nov 2026 (month in progress).

Outputs: data/interim/forecast_backtest.csv, forecast_scores.csv, data/web/forecast.json
Written with help from Claude (AI).
"""
import json
import re
import warnings
import numpy as np
import pandas as pd
import forecast_lib as fl
from config import INTERIM, WEB, PROVINCE, FORECAST_LAST_COMPLETE_YM, FORECAST_TARGET_YM, SPARSE_DISTRICTS

warnings.filterwarnings("ignore")
slug = lambda s: re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
ymstr = lambda ym: f"{ym // 100}-{ym % 100:02d}"


def clean(o):
    if isinstance(o, dict): return {str(k): clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return [clean(v) for v in o]
    if hasattr(o, "item"): o = o.item()
    if isinstance(o, float) and not np.isfinite(o): return None
    if isinstance(o, float): return round(o, 3)
    return o


def main():
    P, enso = fl.load()
    stages = {"A_test_2021_2025": (202012, [ym for ym in P.index if 202101 <= ym <= 202512]),
              "B_test_2026_jan_oct": (202512, [ym for ym in P.index if 202601 <= ym <= FORECAST_LAST_COMPLETE_YM]),
              "C_forecast": (FORECAST_LAST_COMPLETE_YM, [FORECAST_TARGET_YM])}
    out, scores, fits = {}, {}, {}
    for name, (end, yms) in stages.items():
        test, sparse, res, epochs = fl.run_stage(P, enso, end, yms)
        test["stage"] = name; sparse["stage"] = name
        out[name] = (test, sparse); fits[name] = (res, epochs)
        if name != "C_forecast":
            scores[name] = fl.evaluate(test, sparse)
        print(f"{name}: LSTM best epochs per seed {epochs}", flush=True)

    pd.concat([pd.concat(v) for v in out.values()]).to_csv(INTERIM / "forecast_backtest.csv", index=False)
    sc = pd.concat(scores, names=["stage", "model"]).round(3)
    sc.to_csv(INTERIM / "forecast_scores.csv")

    test, sparse = out["C_forecast"]
    by_region = {}
    for r in test.itertuples():
        by_region[slug(r.district)] = {"climatology": r.clim_median, "climatology_mean": r.clim_mean, "persistence": r.persistence,
                                       "nb": r.nb, "nb_low": r.nb_low, "nb_high": r.nb_high, "p_above_normal": r.p_above_nb,
                                       "p_above_normal_climatology": r.p_above_clim,
                                       "lstm": r.lstm, "lstm_low": r.lstm_low, "lstm_high": r.lstm_high, "modeled": True}
    for r in sparse.itertuples():
        by_region[slug(r.district)] = {"climatology": r.clim_median, "climatology_mean": r.clim_mean, "persistence": r.persistence,
                                       "nb": None, "p_above_normal": None, "lstm": None, "modeled": False,
                                       "note": "Too few hotspots to model; climatology only"}
    keys = ["climatology", "persistence", "nb", "nb_low", "nb_high", "lstm", "lstm_low", "lstm_high"]
    prov = {k: float(test[{"climatology": "clim_median"}.get(k, k)].sum() + sparse[{"persistence": "persistence"}.get(k, "clim_median")].sum()) for k in keys}
    prov["note"] = "Sum of district forecasts; the range is approximate (sum of district bounds)."
    by_region[slug(PROVINCE)] = prov

    def showcase(test, sparse):
        res = {}
        cols = ["y", "clim_median", "persistence", "nb", "nb_low", "nb_high", "lstm"]
        groups = list(test.groupby("district")) + [(PROVINCE, None)]
        for d, g in groups:
            if g is None:
                g = test.groupby("ym")[cols].sum().reset_index()
                sp = sparse.groupby("ym")[["y", "clim_median", "persistence"]].sum()
                for c in cols:
                    g[c] = g[c].to_numpy() + sp["persistence" if c == "persistence" else ("y" if c == "y" else "clim_median")].to_numpy()
            g = g.sort_values("ym")
            res[slug(d)] = {"months": [ymstr(m) for m in g.ym], "actual": g.y.tolist(), "climatology": g.clim_median.tolist(),
                            "persistence": g.persistence.tolist(), "nb": g.nb.tolist(), "nb_low": g.nb_low.tolist(),
                            "nb_high": g.nb_high.tolist(), "lstm": g.lstm.tolist()}
        return res

    res_c = fits["C_forecast"][0]
    coef = res_c.params.drop("alpha")
    sA, sB = scores["A_test_2021_2025"], scores["B_test_2026_jan_oct"]
    forecast = {
        "target_month": ymstr(FORECAST_TARGET_YM),
        "target_note": "Month in progress; forecast uses data through the end of the previous month.",
        "trained_through": ymstr(FORECAST_LAST_COMPLETE_YM),
        "unit": "harmonized hotspots (NOAA-20 equivalent) per month",
        "main_model": "nb",
        "models": ["climatology", "persistence", "nb", "lstm"],
        "model_notes": {
            "climatology": "Median of the same month in training years (descriptive statistics)",
            "persistence": "Next month equals this month",
            "nb": "Negative Binomial regression: climatology offset + last 1-2 months anomaly + Nino 3.4 (lag 1) in the dry season",
            "lstm": "Small LSTM (3-month window, 8 units, numpy); experimental"},
        "point_forecast": "median of the predictive distribution",
        "interval": "10th-90th percentile",
        "above_normal_definition": "more than 1.5x the normal for that month (same as calendar class >= 1)",
        "backtest_2021_2025": sA.rename(index={"clim_median": "climatology"}).drop(index="clim_mean").to_dict(orient="index"),
        "test_2026_jan_oct": sB.rename(index={"clim_median": "climatology"}).drop(index="clim_mean").to_dict(orient="index"),
        "nb_effects_multiplier": {k: float(np.exp(v)) for k, v in coef.items() if k != "const"},
        "by_region": by_region,
        "showcase_2026": showcase(*out["B_test_2026_jan_oct"]),
        "sparse_districts": SPARSE_DISTRICTS,
        "experimental": True,
        "limitations": ["All models under-predict extreme seasons such as 2026; use the probability of above-normal and the range, not the point alone.",
                        "The Nino 3.4 effect is small once last month's anomaly is included.",
                        "One-month horizon only."],
    }
    with open(WEB / "forecast.json", "w") as f:
        json.dump(clean(forecast), f, separators=(",", ":"), allow_nan=False)
    pd.set_option("display.width", 170)
    print(sc.to_string())
    print("\nNov 2026 forecast, province:", {k: round(v) for k, v in prov.items() if k != "note"})
    print("NB effects (multiplier):", {k: round(float(np.exp(v)), 3) for k, v in coef.items()})


if __name__ == "__main__":
    main()
