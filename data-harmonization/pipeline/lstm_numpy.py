"""Minimal LSTM regressor in pure numpy (single layer, many-to-one, Adam, MSE).

Used by step6 so the pipeline runs without PyTorch/TensorFlow. Gradients are verified
numerically by `gradient_check()`. Written with help from Claude (AI).
"""
import numpy as np

def sigmoid(x): return 1.0 / (1.0 + np.exp(-x))

class LSTMRegressor:
    def __init__(self, n_in, n_static, n_hidden=16, seed=0, l2=1e-4):
        rng = np.random.default_rng(seed)
        s = 1.0 / np.sqrt(n_in + n_hidden)
        self.p = {
            "W": rng.normal(0, s, (n_in + n_hidden, 4 * n_hidden)),   # gates: i, f, o, g
            "b": np.zeros(4 * n_hidden),
            "V": rng.normal(0, 1.0 / np.sqrt(n_hidden + n_static), (n_hidden + n_static,)),
            "c": np.zeros(1),
        }
        self.p["b"][n_hidden:2 * n_hidden] = 1.0                      # forget-gate bias
        self.H, self.l2 = n_hidden, l2
        self.m = {k: np.zeros_like(v) for k, v in self.p.items()}
        self.v = {k: np.zeros_like(v) for k, v in self.p.items()}
        self.t = 0

    def forward(self, X, Z):
        B, T, _ = X.shape; H = self.H; W, b = self.p["W"], self.p["b"]
        h = np.zeros((B, H)); c = np.zeros((B, H)); cache = []
        for t in range(T):
            xh = np.concatenate([X[:, t], h], axis=1)
            a = xh @ W + b
            i, f, o = sigmoid(a[:, :H]), sigmoid(a[:, H:2*H]), sigmoid(a[:, 2*H:3*H])
            g = np.tanh(a[:, 3*H:])
            c_new = f * c + i * g; h_new = o * np.tanh(c_new)
            cache.append((xh, i, f, o, g, c, c_new)); h, c = h_new, c_new
        u = np.concatenate([h, Z], axis=1)
        yhat = u @ self.p["V"] + self.p["c"][0]
        return yhat, (cache, u, h)

    def loss_grad(self, X, Z, y, w=None):
        B = len(y); H = self.H; w = np.ones(B) if w is None else w
        yhat, (cache, u, h) = self.forward(X, Z)
        err = yhat - y
        loss = np.sum(w * err**2) / np.sum(w) + self.l2 * (np.sum(self.p["W"]**2) + np.sum(self.p["V"]**2))
        dy = 2 * w * err / np.sum(w)
        g = {k: np.zeros_like(v) for k, v in self.p.items()}
        g["V"] = u.T @ dy + 2 * self.l2 * self.p["V"]; g["c"] = np.array([dy.sum()])
        dh = np.outer(dy, self.p["V"][:H]); dc = np.zeros_like(dh)
        W = self.p["W"]
        for (xh, i, f, o, gg, c_prev, c_new) in reversed(cache):
            tc = np.tanh(c_new)
            do = dh * tc; dc = dc + dh * o * (1 - tc**2)
            di = dc * gg; dg = dc * i; df = dc * c_prev
            da = np.concatenate([di * i * (1 - i), df * f * (1 - f), do * o * (1 - o), dg * (1 - gg**2)], axis=1)
            g["W"] += xh.T @ da; g["b"] += da.sum(0)
            dxh = da @ W.T
            dh = dxh[:, -H:]; dc = dc * f
        g["W"] += 2 * self.l2 * W
        return loss, g

    def step(self, g, lr=5e-3, b1=0.9, b2=0.999, eps=1e-8, clip=5.0):
        norm = np.sqrt(sum(np.sum(v**2) for v in g.values()))
        scale = min(1.0, clip / (norm + 1e-12)); self.t += 1
        for k in self.p:
            gk = g[k] * scale
            self.m[k] = b1 * self.m[k] + (1 - b1) * gk
            self.v[k] = b2 * self.v[k] + (1 - b2) * gk**2
            mh = self.m[k] / (1 - b1**self.t); vh = self.v[k] / (1 - b2**self.t)
            self.p[k] -= lr * mh / (np.sqrt(vh) + eps)

    def predict(self, X, Z): return self.forward(X, Z)[0]

def gradient_check(seed=1):
    rng = np.random.default_rng(seed)
    X, Z, y = rng.normal(size=(5, 4, 3)), rng.normal(size=(5, 2)), rng.normal(size=5)
    m = LSTMRegressor(3, 2, n_hidden=4, seed=seed)
    _, g = m.loss_grad(X, Z, y); worst = 0.0
    for k in m.p:
        flat = m.p[k].reshape(-1)
        for idx in rng.choice(flat.size, size=min(6, flat.size), replace=False):
            old = flat[idx]; flat[idx] = old + 1e-6; lp, _ = m.loss_grad(X, Z, y)
            flat[idx] = old - 1e-6; lm, _ = m.loss_grad(X, Z, y); flat[idx] = old
            num = (lp - lm) / 2e-6; ana = g[k].reshape(-1)[idx]
            worst = max(worst, abs(num - ana) / max(1e-8, abs(num) + abs(ana)))
    return worst

if __name__ == "__main__":
    print("max relative gradient error:", gradient_check())
