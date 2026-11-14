"""Run the full Niskala data-harmonization pipeline in order.

Usage:  python run_pipeline.py            # all steps
        python run_pipeline.py 2 3        # only selected steps
Written with help from Claude (AI).
"""
import runpy, sys, time
from pathlib import Path

STEPS = {
    1: "step1_prepare_hotspots.py",
    2: "step2_harmonize.py",
    3: "step3_anomaly_sipongi_export.py",
    4: "step4_export_points.py",
    5: "step5_chart.py",
    6: "step6_forecast.py",
}
here = Path(__file__).resolve().parent / "pipeline"
sys.path.insert(0, str(here))
chosen = [int(a) for a in sys.argv[1:]] or list(STEPS)
for n in chosen:
    t = time.time()
    print(f"\n=== Step {n}: {STEPS[n]} ===", flush=True)
    runpy.run_path(str(here / STEPS[n]), run_name="__main__")
    print(f"--- done in {time.time() - t:.1f}s", flush=True)
