"""Diagnostic: learning curves for the step-6 LSTM (Stage A: train <= 2018, validation 2019-2020, test 2021-2025).

Output: outputs/figures/lstm_learning_curves.png, data/interim/lstm_learning_curves.csv
Written with help from Claude (AI).
"""
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import forecast_lib as fl
from config import FIGURES, INTERIM, SPARSE_DISTRICTS

warnings.filterwarnings("ignore")


def curves(seeds=(0, 1, 2), epochs=400):
    P, enso = fl.load()
    clim = fl.climatology(P, 202012)
    mod = [d for d in P.columns if d not in SPARSE_DISTRICTS]
    rows = fl.features(P, enso, clim, [ym for ym in P.index if ym <= 202512], mod)
    tr, va, te = rows[rows.ym // 100 <= 2018], rows[(rows.ym // 100).isin([2019, 2020])], rows[rows.ym // 100 >= 2021]
    Xtr, Ztr, Ytr = fl.lstm_arrays(P, enso, clim, tr)
    Xva, Zva, Yva = fl.lstm_arrays(P, enso, clim, va)
    Xte, Zte, Yte = fl.lstm_arrays(P, enso, clim, te)
    out = []
    for s in seeds:
        m = fl.LSTMRegressor(Xtr.shape[2], Ztr.shape[1], n_hidden=fl.LSTM_HIDDEN, seed=s, l2=fl.LSTM_L2)
        for ep in range(epochs + 1):
            if ep % 5 == 0:
                out.append(dict(seed=s, epoch=ep, train=np.mean((m.predict(Xtr, Ztr) - Ytr) ** 2),
                                validation=np.mean((m.predict(Xva, Zva) - Yva) ** 2), test=np.mean((m.predict(Xte, Zte) - Yte) ** 2)))
            _, g = m.loss_grad(Xtr, Ztr, Ytr); m.step(g)
    base = {"climatology_validation": float(np.mean(Yva ** 2)), "climatology_test": float(np.mean(Yte ** 2))}
    return pd.DataFrame(out), base


def plot(df, base, path=None):
    colors = {"train": "#2a78d6", "validation": "#eb6834", "test": "#1baf7a"}
    fig, ax = plt.subplots(figsize=(9, 4.5))
    for col, c in colors.items():
        for _, g in df.groupby("seed"):
            ax.plot(g.epoch, g[col], color=c, lw=0.8, alpha=0.3)
        mean = df.groupby("epoch")[col].mean()
        ax.plot(mean.index, mean.values, color=c, lw=2.2, label=col.capitalize())
    ax.axhline(base["climatology_validation"], color="#898781", ls="--", lw=1.2, label="Climatology, validation")
    ax.axhline(base["climatology_test"], color="#898781", ls=":", lw=1.4, label="Climatology, test")
    best = df.groupby("epoch").validation.mean().idxmin()
    ax.axvline(best, color="#eb6834", lw=0.8, ls="-.")
    ax.set(xlabel="Epoch", ylabel="MSE of log anomaly", title=f"LSTM learning curves (best validation at epoch {best})")
    ax.spines[["top", "right"]].set_visible(False); ax.grid(axis="y", color="#e4e3df")
    ax.legend(frameon=False, fontsize=9, ncol=2)
    fig.tight_layout()
    if path:
        fig.savefig(path, dpi=160)
    return fig


if __name__ == "__main__":
    plt.switch_backend("Agg")
    df, base = curves()
    df.to_csv(INTERIM / "lstm_learning_curves.csv", index=False)
    plot(df, base, FIGURES / "lstm_learning_curves.png")
    print(base, df.groupby("epoch")[["train", "validation", "test"]].mean().iloc[::10].round(3).to_string())
