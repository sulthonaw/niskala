"""Preprocessing and models for the next-month forecast (step 6).

Decisions come from the EDA (see EDA.md): counts are overdispersed, seasonality is strong,
ENSO helps at a 1-2 month lead, memory is short, and districts move together.
Every function that needs a "normal" recomputes it from the training period only.
Written with help from Claude (AI).
"""
import numpy as np
import pandas as pd
import statsmodels.api as sm
from scipy import stats
from config import (INTERIM, ENSO, ENSO_MISSING, HARMONIZED_START_YM, FORECAST_LAST_COMPLETE_YM, ANOMALY_C,
                    PROVINCE, SPARSE_DISTRICTS, DRY_MONTHS, FIRE_SEASON_MONTHS, LSTM_WINDOW, LSTM_HIDDEN,
                    LSTM_L2, ABOVE_NORMAL_RATIO)
from lstm_numpy import LSTMRegressor


def ym_add(ym, k):
    t = (ym // 100) * 12 + ym % 100 - 1 + k
    return (t // 12) * 100 + t % 12 + 1


def load():
    h = pd.read_csv(INTERIM / "harmonized_monthly.csv")
    h = h[(h.ym >= HARMONIZED_START_YM) & (h.ym <= FORECAST_LAST_COMPLETE_YM)]
    P = h.pivot(index="ym", columns="district", values="harmonized")
    rows = []
    for line in open(ENSO):
        p = line.split()
        if len(p) == 13 and p[0].isdigit():
            rows += [(int(p[0]) * 100 + k, float(v)) for k, v in enumerate(p[1:], 1)]
    enso = pd.Series(dict(rows)).replace(ENSO_MISSING, np.nan).ffill()
    return P, enso


def climatology(P, train_end):
    T = P[P.index <= train_end]
    m = T.index % 100
    mean = T.groupby(m).mean()
    logmean = np.log1p(T).groupby(m).mean()
    thr = ABOVE_NORMAL_RATIO * (mean + ANOMALY_C) - ANOMALY_C
    p_above = (T > thr.reindex(m).set_axis(T.index)).groupby(m).mean()
    return {"mean": mean, "median": T.groupby(m).median(), "logmean": logmean, "thr": thr, "p_above": p_above}


def features(P, enso, clim, target_yms, districts):
    """One row per (target month, district) with lagged inputs known at forecast time."""
    rows = []
    for ym in target_yms:
        m = ym % 100
        l1, l2 = ym_add(ym, -1), ym_add(ym, -2)
        if ym_add(ym, -max(2, LSTM_WINDOW)) not in P.index:
            continue
        for d in districts:
            a1 = np.log1p(P.at[l1, d]) - clim["logmean"].at[l1 % 100, d]
            a2 = np.log1p(P.at[l2, d]) - clim["logmean"].at[l2 % 100, d]
            rows.append(dict(ym=ym, district=d, month=m, dry=int(m in DRY_MONTHS),
                             y=P.at[ym, d] if ym in P.index else np.nan,
                             clim_mean=clim["mean"].at[m, d], clim_logmean=clim["logmean"].at[m, d],
                             thr=clim["thr"].at[m, d], p_above_clim=clim["p_above"].at[m, d],
                             persistence=P.at[l1, d], anom_l1=a1, anom_l2=a2,
                             enso_l1=enso[l1], enso_l2=enso[l2]))
    df = pd.DataFrame(rows)
    df["offset"] = np.log(df.clim_mean + 0.5)
    df["clim_median"] = [clim["median"].at[m, d] for m, d in zip(df.month, df.district)] if len(df) else []
    return df


NB_TERMS = ["const", "dry", "enso_l1_dry", "anom_l1", "anom_l2", "anom_l1_dry"]   # chosen on 2019-2020 validation


def nb_design(df):
    X = pd.DataFrame({"const": 1.0, "dry": df.dry,
                      "enso_l1_dry": df.enso_l1 * df.dry, "enso_l2_dry": df.enso_l2 * df.dry,
                      "anom_l1": df.anom_l1, "anom_l2": df.anom_l2, "anom_l1_dry": df.anom_l1 * df.dry})
    return X[NB_TERMS]


def fit_nb(train):
    model = sm.NegativeBinomial(np.round(train.y).astype(int), nb_design(train), offset=train.offset)
    return model.fit(disp=0, maxiter=300)


def predict_nb(res, df):
    mu = np.asarray(res.predict(nb_design(df), offset=df.offset))
    alpha = float(res.params["alpha"])
    n = 1.0 / alpha
    p = n / (n + mu)
    out = pd.DataFrame({"nb": stats.nbinom.ppf(0.5, n, p), "nb_mean": mu,
                        "nb_low": stats.nbinom.ppf(0.1, n, p), "nb_high": stats.nbinom.ppf(0.9, n, p),
                        "p_above_nb": stats.nbinom.sf(np.floor(df.thr.clip(lower=0)), n, p)}, index=df.index)
    return out


def lstm_arrays(P, enso, clim, df):
    X, Z, Y = [], [], []
    for r in df.itertuples():
        ws = [ym_add(r.ym, -k) for k in range(LSTM_WINDOW, 0, -1)]
        seq = []
        for w in ws:
            v = P.at[w, r.district]; mo = w % 100
            seq.append([np.log1p(v) / 10, (np.log1p(v) - clim["logmean"].at[mo, r.district]) / 3,
                        enso[w], np.sin(2 * np.pi * mo / 12), np.cos(2 * np.pi * mo / 12)])
        X.append(seq)
        Z.append([r.clim_logmean / 10, np.sin(2 * np.pi * r.month / 12), np.cos(2 * np.pi * r.month / 12), r.enso_l1, r.dry])
        Y.append(np.log1p(r.y) - r.clim_logmean if not np.isnan(r.y) else np.nan)
    return np.array(X), np.array(Z), np.array(Y)


def train_lstm(Xtr, Ztr, Ytr, Xva, Zva, Yva, seed, lr=5e-3, max_epochs=300, every=5, patience=10, record=False):
    m = LSTMRegressor(Xtr.shape[2], Ztr.shape[1], n_hidden=LSTM_HIDDEN, seed=seed, l2=LSTM_L2)
    best, best_ep, bad, hist = np.inf, 0, 0, []
    for ep in range(max_epochs + 1):
        if ep % every == 0:
            v = float(np.mean((m.predict(Xva, Zva) - Yva) ** 2))
            if record:
                hist.append((ep, float(np.mean((m.predict(Xtr, Ztr) - Ytr) ** 2)), v))
            if v < best - 1e-4:
                best, best_ep, bad = v, ep, 0
            else:
                bad += 1
                if bad >= patience and not record:
                    break
        _, g = m.loss_grad(Xtr, Ztr, Ytr); m.step(g, lr=lr)
    return best_ep, best, hist


def fit_predict_lstm(P, enso, clim, train, val, test, seeds=(0, 1, 2)):
    Xtr, Ztr, Ytr = lstm_arrays(P, enso, clim, train)
    Xva, Zva, Yva = lstm_arrays(P, enso, clim, val)
    Xte, Zte, _ = lstm_arrays(P, enso, clim, test)
    Xa, Za, Ya = np.concatenate([Xtr, Xva]), np.concatenate([Ztr, Zva]), np.concatenate([Ytr, Yva])
    preds, resid_sd, epochs = [], [], []
    for s in seeds:
        best_ep, _, _ = train_lstm(Xtr, Ztr, Ytr, Xva, Zva, Yva, seed=s)
        m = LSTMRegressor(Xa.shape[2], Za.shape[1], n_hidden=LSTM_HIDDEN, seed=s, l2=LSTM_L2)
        for _ in range(max(best_ep, 20)):
            _, g = m.loss_grad(Xa, Za, Ya); m.step(g)
        preds.append(m.predict(Xte, Zte)); resid_sd.append(np.std(m.predict(Xa, Za) - Ya)); epochs.append(best_ep)
    lp = test.clim_logmean.to_numpy() + np.mean(preds, 0)
    sd = float(np.mean(resid_sd))
    out = pd.DataFrame({"lstm": np.expm1(lp), "lstm_mean": np.expm1(lp + sd ** 2 / 2), "lstm_low": np.expm1(lp - 1.2816 * sd).clip(0), "lstm_high": np.expm1(lp + 1.2816 * sd),
                        "p_above_lstm": 1 - stats.norm.cdf((np.log1p(test.thr.clip(lower=0)) - lp) / sd)}, index=test.index)
    return out, epochs


def run_stage(P, enso, train_end, test_yms, with_lstm=True):
    clim = climatology(P, train_end)
    modeled = [d for d in P.columns if d not in SPARSE_DISTRICTS]
    train_yms = [ym for ym in P.index if ym <= train_end]
    all_train = features(P, enso, clim, train_yms, modeled)
    test = features(P, enso, clim, test_yms, modeled)
    res = fit_nb(all_train)
    test = test.join(predict_nb(res, test))
    epochs = None
    if with_lstm:
        last2 = sorted({ym // 100 for ym in train_yms})[-2:]
        tr = all_train[~(all_train.ym // 100).isin(last2)]
        va = all_train[(all_train.ym // 100).isin(last2)]
        lo, epochs = fit_predict_lstm(P, enso, clim, tr, va, test)
        test = test.join(lo)
    sparse = features(P, enso, clim, test_yms, SPARSE_DISTRICTS)
    return test, sparse, res, epochs


MODELS = ["clim_median", "clim_mean", "persistence", "nb", "lstm"]
SUM_COL = {}   # province total = sum of the same point forecasts (medians)


def evaluate(test, sparse):
    t = test.dropna(subset=["y"])
    out = {}
    s = sparse.dropna(subset=["y"])
    for mdl in MODELS:
        if mdl not in t:
            continue
        e = t[mdl] - t.y
        fs = t.month.isin(FIRE_SEASON_MONTHS)
        prov_pred = t.groupby("ym")[SUM_COL.get(mdl, mdl)].sum() + s.groupby("ym")["persistence" if mdl == "persistence" else "clim_mean"].sum()
        prov_obs = t.groupby("ym").y.sum() + s.groupby("ym").y.sum()
        out[mdl] = {"mae": e.abs().mean(), "rmse": np.sqrt((e ** 2).mean()), "mae_fire_season": e[fs].abs().mean(),
                    "log_mae": (np.log1p(t[mdl]) - np.log1p(t.y)).abs().mean(),
                    "province_mae": (prov_pred - prov_obs).abs().mean()}
    obs = (t.y > t.thr).astype(float)
    for mdl, col in [("clim_median", "p_above_clim"), ("clim_mean", "p_above_clim"), ("nb", "p_above_nb"), ("lstm", "p_above_lstm")]:
        if col in t:
            out[mdl]["brier_above_normal"] = float(((t[col] - obs) ** 2).mean())
    return pd.DataFrame(out).T
