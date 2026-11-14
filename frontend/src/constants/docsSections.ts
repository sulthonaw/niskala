/**
 * Content for the /docs page.
 *
 * Text blocks support a small inline syntax:
 *   $...$        inline LaTeX (rendered with KaTeX)
 *   **...**      bold
 *   `...`        inline code
 *   [label](url) link
 * Display equations use a `math` block. Use String.raw for any LaTeX with backslashes.
 */

export const GITHUB_REPO_URL = 'https://github.com/sulthonaw/niskala';

const FIG = (name: string) => `${import.meta.env.BASE_URL}docs/figures/${name}`;

export type DocBlock =
  | { kind: 'text'; text: string }
  | { kind: 'math'; tex: string; caption?: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | {
      kind: 'table';
      columns: string[];
      rows: (string | number)[][];
      align?: ('left' | 'right')[];
      caption?: string;
    }
  | { kind: 'figure'; src: string; alt: string; caption: string }
  | { kind: 'code'; title?: string; code: string }
  | { kind: 'callout'; tone?: 'info' | 'warn'; title?: string; text: string }
  | { kind: 'links'; items: { label: string; href: string; note?: string }[] }
  | { kind: 'calibrationTable' };

export interface DocSection {
  id: string;
  heading: string;
  blocks: DocBlock[];
}

export interface DocArticle {
  id: string;
  group: string;
  label: string;
  title: string;
  summary: string;
  sections: DocSection[];
  /** Repository files this article describes. */
  sources?: string[];
}

export interface DocGroup {
  title: string;
  items: DocArticle[];
}

/* ------------------------------------------------------------------ */
/* VALIDATION                                                          */
/* ------------------------------------------------------------------ */

const calibrationValidation: DocArticle = {
  id: 'calibration-validation',
  group: 'Validation',
  label: 'Calibration & Validation',
  title: 'District Calibration & SiPongi Correlation',
  summary:
    'Shrunk NOAA-20 / Aqua multipliers, normal peak months, and 2016–2025 SiPongi correlations across West Kalimantan and all 14 districts.',
  sources: ['data-harmonization/data/web/meta.json', 'frontend/public/data/meta.json'],
  sections: [
    {
      id: 'matrix',
      heading: 'Regional calibration parameters',
      blocks: [
        {
          kind: 'text',
          text: 'Before April 2018, MODIS Aqua counts are multiplied by each region’s shrunk NOAA-20 / Aqua ratio (`r_district`). Click **Inspect** on any row to jump straight to that region in the Anomaly Calendar.',
        },
        { kind: 'calibrationTable' },
        {
          kind: 'callout',
          tone: 'info',
          title: 'How shrunk ratios work',
          text: 'Districts with very few overlap hotspots (such as Kota Pontianak) are pulled toward the province average ($k = 100$) so small sample noise does not distort the multiplier. Full formulas are in **Harmonization** and **Validation with SiPongi**.',
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* ABOUT                                                               */
/* ------------------------------------------------------------------ */

const whatIsNiskala: DocArticle = {
  id: 'what-is-niskala',
  group: 'About',
  label: 'What is Niskala',
  title: 'What is Niskala',
  summary:
    'Niskala is a web dashboard that tells fire officers in West Kalimantan whether this month’s hotspot count is normal, where it is unusual, and whether ground data agrees. It does this by turning MODIS and VIIRS detections into one consistent monthly series.',
  sources: ['data-harmonization/README.md', 'frontend/src/pages/Home/HomePage.tsx'],
  sections: [
    {
      id: 'problem',
      heading: 'The problem it solves',
      blocks: [
        {
          kind: 'text',
          text: 'NASA FIRMS publishes active-fire detections from two instrument families. **MODIS** has 1 km pixels and has been flying since 2000. **VIIRS** has 375 m pixels and sees many more small fires. Over the same area and the same months, VIIRS NOAA-20 reports about **5.3 times** as many hotspots as MODIS Aqua.',
        },
        {
          kind: 'text',
          text: 'That difference breaks any long-term comparison. If we simply add up whatever sensors are available, West Kalimantan goes from 2,049 detections in 2017 to 33,891 in 2018. Nothing happened on the ground; NOAA-20 data simply starts in April 2018. So when a BPBD officer sees “3,000 hotspots this month”, there is no fair history to say if that is high or low.',
        },
        {
          kind: 'figure',
          src: FIG('chart_naive_vs_harmonized.png'),
          alt: 'Yearly hotspot totals for West Kalimantan, naive sum versus harmonized series',
          caption:
            'Naive sum of sensors (jumps when VIIRS starts) versus the harmonized series used by Niskala (one scale, NOAA-20 equivalent).',
        },
      ],
    },
    {
      id: 'answers',
      heading: 'What the dashboard answers',
      blocks: [
        {
          kind: 'text',
          text: 'Once every month is on the same scale, we can compare it with a fair “normal” for that district and month. The dashboard is built around three questions:',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            '**Is this month normal?** An anomaly calendar colors each month by how far it is from its normal, from “much below” to “extreme”.',
            '**Where is it unusual?** A district ranking shows which of the 14 districts are furthest above their own normal.',
            '**Does the ground agree?** SiPongi burned-area records are used to check that the satellite signal points the same way.',
          ],
        },
        {
          kind: 'text',
          text: 'The pipeline also produces an experimental one-month outlook in `forecast.json` (see **Forecast model**). It gives a range and a probability instead of a single number, though only the historical calendar, ranking, and SiPongi views are wired into the web interface so far.',
        },
      ],
    },
    {
      id: 'how-built',
      heading: 'How it is built',
      blocks: [
        {
          kind: 'text',
          text: 'All heavy work runs offline in a Python pipeline inside the `data-harmonization` folder of this repository. It reads the raw files, harmonizes sensors, computes the normals and anomalies, runs the forecast, and writes small JSON files. The website is a static React app that reads those JSON files, so there is no server or database to run.',
        },
        {
          kind: 'table',
          columns: ['Part', 'Technology', 'Role'],
          rows: [
            ['Data pipeline', 'Python, pandas, numpy, shapely, statsmodels', 'Raw data → harmonized monthly series → JSON'],
            ['Notebooks', 'Jupyter', 'EDA and modeling, executed and kept in the repo'],
            ['Frontend', 'React 19, Vite, TypeScript, Tailwind, KaTeX', 'Reads meta, calendar, annual and sipongi JSON to render the dashboard and math docs'],
          ],
        },
      ],
    },
    {
      id: 'dashboard-guide',
      heading: 'How to read the web app',
      blocks: [
        {
          kind: 'list',
          items: [
            '**Calendar (`/calendar`):** Pick West Kalimantan or any of the 14 districts, jump to reference months (`Jul 2026` or `Oct 2026`), or toggle between the color grid and the sortable table. Rows from January 2001 to June 2002 appear as **Terra only** (uncalibrated).',
            '**District Ranking (`>= 20 pts` rule):** Months with tiny normal averages can look like extreme spikes from just one or two detections. Districts with fewer than **20** harmonized hotspots in the focus month are marked *low activity* and placed below active districts.',
            '**Calibration & Validation (top of Docs):** Lists each region’s shrunk and raw NOAA-20 / Aqua multipliers, normal peak months, and 2016–2025 Spearman correlation against SiPongi.',
          ],
        },
      ],
    },
  ],
};

const whyKalbar: DocArticle = {
  id: 'why-west-kalimantan',
  group: 'About',
  label: 'Why West Kalimantan',
  title: 'Why West Kalimantan',
  summary:
    'We started with one province so that every step could be checked by hand. West Kalimantan was chosen because fires there are frequent and seasonal, 2026 is an extreme year, and district-level ground data exists for validation.',
  sources: ['data-harmonization/data/web/annual.json'],
  sections: [
    {
      id: 'fire-region',
      heading: 'A major peat-fire region',
      blocks: [
        {
          kind: 'text',
          text: 'Research on Kalimantan fires finds that burning is concentrated in West and Central Kalimantan, mostly on lowland peat. The same study reports that August–October hotspots rise by about 17% in El Niño years and fall by about 85% in La Niña years ([Zahra et al., 2023](https://reference-global.com/article/10.14746/quageo-2023-0006)). Peat fires smoulder, are hard to put out, and drive the haze that reaches cities, so early warning matters here.',
        },
      ],
    },
    {
      id: 'season-2026',
      heading: '2026 is an extreme season',
      blocks: [
        {
          kind: 'text',
          text: 'Up to 13 November 2026 (UTC), the province already has **79,758** harmonized hotspots. That is the highest yearly total in our 2002–2026 record, just above 2006, and about **4.3 times** the 2025 total. August 2026 alone had 37,034. A tool that says “how unusual is this” is most useful in a year like this one.',
        },
        {
          kind: 'table',
          caption: 'Yearly totals for the province. “Naive” adds Aqua, Terra and NOAA-20 as they are. “Harmonized” is the NOAA-20-equivalent series.',
          columns: ['Year', 'Aqua', 'NOAA-20', 'Naive sum', 'Harmonized'],
          align: ['left', 'right', 'right', 'right', 'right'],
          rows: [
            ['2006', '14,513', '—', '18,534', '79,692'],
            ['2015', '9,665', '—', '13,054', '52,063'],
            ['2017', '1,874', '—', '2,049', '9,437'],
            ['2018', '5,078', '27,142', '33,891', '28,555'],
            ['2019', '7,200', '40,915', '51,410', '40,915'],
            ['2025', '3,544', '18,688', '22,469', '18,688'],
            ['2026*', '12,616', '79,758', '99,944', '79,758'],
          ],
        },
        {
          kind: 'text',
          text: '*2026 runs to 13 November. Note how the naive sum makes 2019 look like the worst year on record, while the harmonized series correctly shows 2006 and 2026 as the largest seasons.',
        },
      ],
    },
    {
      id: 'fit',
      heading: 'Why it fits a monthly calendar',
      blocks: [
        {
          kind: 'list',
          items: [
            '**One clear season.** About 91% of a year’s hotspots fall in July–October, with the peak in August or September. A month-by-month calendar shows this well.',
            '**Large year-to-year swings.** Fire-season totals differ by about 9 times between quiet and severe years, so “compared with normal” carries real information.',
            '**Ground data to check against.** SiPongi publishes indicative burned area for each district from 2016, which lets us test whether the satellite anomalies are real.',
            '**A manageable size.** 14 districts (12 regencies and 2 cities) inside a box of 108.0°–114.2° E and 3.1° S–2.1° N.',
          ],
        },
        {
          kind: 'callout',
          tone: 'info',
          title: 'Not limited to one province',
          text: 'Nothing in the method is specific to West Kalimantan. The region box, boundaries and district list live in one config file. The **Roadmap** page explains what is needed to run it for another province.',
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* DATA & STATISTICS                                                   */
/* ------------------------------------------------------------------ */

const pipelineProcess: DocArticle = {
  id: 'process',
  group: 'Data & Statistics',
  label: 'Process overview',
  title: 'How the pipeline works',
  summary:
    'The pipeline runs in six steps, from raw satellite files to the JSON files the website reads. Each step writes its result to disk, so any step can be checked or rerun on its own.',
  sources: ['data-harmonization/run_pipeline.py', 'data-harmonization/pipeline/config.py'],
  sections: [
    {
      id: 'steps',
      heading: 'The six steps',
      blocks: [
        {
          kind: 'table',
          columns: ['Step', 'Script', 'What it does'],
          rows: [
            ['1', 'step1_prepare_hotspots.py', 'Unzips FIRMS files, keeps points inside the box, assigns each point to a district, converts UTC to local time (WIB), counts per month, district and sensor'],
            ['2', 'step2_harmonize.py', 'Estimates the NOAA-20 / Aqua ratio per district and builds one NOAA-20-equivalent series'],
            ['3', 'step3_anomaly_sipongi_export.py', 'Computes normals, anomaly ratios and classes; compares with SiPongi; writes calendar, annual and SiPongi JSON'],
            ['4', 'step4_export_points.py', 'Exports recent hotspot points for the map'],
            ['5', 'step5_chart.py', 'Draws the naive-versus-harmonized chart'],
            ['6', 'step6_forecast.py', 'Trains the forecast models, runs the backtests and writes forecast.json'],
          ],
        },
      ],
    },
    {
      id: 'run',
      heading: 'Run it locally',
      blocks: [
        {
          kind: 'text',
          text: 'Put the raw downloads in `data/raw/` as described in `data-harmonization/README.md`. Large raw files are ignored by git. Then run the whole pipeline with one command. On a normal laptop the forecast step takes about one minute.',
        },
        {
          kind: 'code',
          title: 'data-harmonization',
          code: 'pip install -r requirements.txt\npython run_pipeline.py',
        },
        {
          kind: 'text',
          text: 'Copy the contents of `data/web/` into the frontend’s `public/data/` and start the site:',
        },
        {
          kind: 'code',
          title: 'frontend',
          code: 'bun install\nbun run dev',
        },
      ],
    },
    {
      id: 'outputs',
      heading: 'What comes out',
      blocks: [
        {
          kind: 'table',
          columns: ['File', 'Contents'],
          rows: [
            ['meta.json', 'Region, data date, anomaly classes, baseline years, per-district ratios and monthly normals'],
            ['calendar.json', 'One row per district and month: harmonized count, normal, ratio, class, source, partial flag'],
            ['annual.json', 'Yearly totals per district: Aqua, Terra, NOAA-20, naive sum and harmonized'],
            ['sipongi.json', 'Burned area next to hotspots per district and year, with correlation and flags'],
            ['forecast.json', 'One-month outlook and backtest metrics (pipeline output; not yet displayed in the web UI)'],
            ['points/', 'Recent hotspot points for a future map view (not yet displayed in the web UI)'],
          ],
        },
      ],
    },
  ],
};

const dataSources: DocArticle = {
  id: 'data',
  group: 'Data & Statistics',
  label: 'Data & characteristics',
  title: 'Data sources and their characteristics',
  summary:
    'Niskala uses NASA FIRMS active-fire data as its core, with SiPongi burned area for validation, Niño 3.4 for the forecast, and geoBoundaries to assign points to districts. This page lists each source and what the data looks like after counting.',
  sources: ['data-harmonization/EDA.md', 'data-harmonization/notebooks/eda.ipynb'],
  sections: [
    {
      id: 'sources',
      heading: 'Sources',
      blocks: [
        {
          kind: 'table',
          columns: ['Dataset', 'Provider', 'Detail', 'Period used', 'Role'],
          rows: [
            ['MODIS C6.1 Aqua', 'NASA FIRMS', '1 km, ~13:30 overpass', '2002-07 →', 'History before VIIRS'],
            ['MODIS C6.1 Terra', 'NASA FIRMS', '1 km, ~10:30 overpass', '2001 →', 'Kept in totals only, not harmonized'],
            ['VIIRS C2 NOAA-20', 'NASA FIRMS', '375 m, ~13:30 overpass', '2018-04 →', 'Reference scale'],
            ['SiPongi burned area', 'SiPongi (national fire monitoring)', 'Indicative hectares, district and province', '2015/2016 → 2026', 'Validation'],
            ['Niño 3.4 anomaly', 'NOAA PSL (ERSST)', 'Monthly °C anomaly', '2002 → 2026', 'Forecast input'],
            ['geoBoundaries IDN ADM2', 'geoBoundaries', 'District polygons', '—', 'Point-to-district assignment'],
          ],
        },
        {
          kind: 'text',
          text: 'Aqua is used as the MODIS anchor because it crosses the equator at about the same local time as NOAA-20. Terra passes in the morning, when fewer fires are active, so mixing it in would add a second, different bias.',
        },
      ],
    },
    {
      id: 'counting',
      heading: 'From points to monthly counts',
      blocks: [
        {
          kind: 'list',
          items: [
            'Keep points inside the box 108.0°–114.2° E, 3.1° S–2.1° N.',
            'Assign each point to one of the 14 districts with a point-in-polygon test.',
            'Convert acquisition time from UTC to WIB (UTC+7) before taking the date, so night-time detections land on the right local day.',
            'Count detections per sensor, district and month. The province total is the sum of districts.',
          ],
        },
      ],
    },
    {
      id: 'characteristics',
      heading: 'What the monthly counts look like',
      blocks: [
        {
          kind: 'text',
          text: 'Exploratory analysis of the harmonized series (2002-07 to 2026-10, 292 months) shows six things that shape every later choice:',
        },
        {
          kind: 'table',
          columns: ['Property', 'Finding'],
          rows: [
            ['Heavy tails', 'Variance is 460–6,900 times the mean. Skewness drops from 3.5–6.4 to about 0–1 after log(1 + x).'],
            ['Many zeros', '5% (Ketapang) to 41% (Sekadau) of months are zero; Kota Pontianak 78% and Kota Singkawang 57%.'],
            ['Strong season', 'July–October holds 91% of hotspots. The peak is August or September in most years.'],
            ['Big year-to-year swings', 'Fire-season totals range from about 8,400 to 76,700 (9× apart).'],
            ['ENSO link near the season', 'Correlation of Niño 3.4 with the Jul–Oct total: 0.56 (May–Jul), 0.66 (Jun–Aug), 0.71 (Jul–Sep).'],
            ['Short memory', 'Lag-1 autocorrelation of the monthly anomaly is 0.31 (province), ≈ 0 by lag 3.'],
          ],
        },
        {
          kind: 'figure',
          src: FIG('eda_1_distribution.png'),
          alt: 'Distribution of monthly harmonized hotspot counts, raw and log-transformed',
          caption: 'Monthly counts are heavily skewed; log(1 + x) makes them close to symmetric.',
        },
        {
          kind: 'figure',
          src: FIG('eda_2_seasonality.png'),
          alt: 'Monthly hotspot climatology per district',
          caption: 'Seasonal cycle by district. Almost all activity sits in July–October.',
        },
      ],
    },
  ],
};

const harmonization: DocArticle = {
  id: 'harmonization',
  group: 'Data & Statistics',
  label: 'Harmonization',
  title: 'Harmonizing MODIS and VIIRS',
  summary:
    'We put every month on the NOAA-20 scale. During the years when both sensors fly, we learn how many NOAA-20 detections correspond to one Aqua detection in each district, then use that ratio to rescale the older Aqua-only years.',
  sources: ['data-harmonization/pipeline/step2_harmonize.py'],
  sections: [
    {
      id: 'overlap',
      heading: 'Learn from the overlap',
      blocks: [
        {
          kind: 'text',
          text: 'Aqua and NOAA-20 both observe West Kalimantan from April 2018 to December 2025. Let $A_{d,t}$ be Aqua detections and $N_{d,t}$ NOAA-20 detections in district $d$ and month $t$, and let $\\mathcal{O}$ be the set of overlap months. The province-wide ratio is:',
        },
        {
          kind: 'math',
          tex: String.raw`R \;=\; \frac{\sum_{d}\sum_{t \in \mathcal{O}} N_{d,t}}{\sum_{d}\sum_{t \in \mathcal{O}} A_{d,t}} \;=\; 5.283`,
        },
        {
          kind: 'text',
          text: 'One ratio for the whole province is a start, but districts differ. Peat districts with many small fires have a higher ratio, because VIIRS catches small fires that MODIS misses.',
        },
      ],
    },
    {
      id: 'district-ratio',
      heading: 'District ratio with shrinkage',
      blocks: [
        {
          kind: 'text',
          text: 'A district with only a few detections would give a noisy ratio. So we add $k$ “pseudo-detections” that carry the province ratio. Large districts are barely affected; small ones are pulled toward $R$:',
        },
        {
          kind: 'math',
          tex: String.raw`r_d \;=\; \frac{\displaystyle\sum_{t \in \mathcal{O}} N_{d,t} \;+\; k\,R}{\displaystyle\sum_{t \in \mathcal{O}} A_{d,t} \;+\; k}, \qquad k = 100`,
        },
        {
          kind: 'text',
          text: 'Example: Kota Pontianak has very few Aqua detections and a raw ratio of 17.8, which is not believable. After shrinkage it becomes 6.0. Ketapang has thousands of detections, so its ratio stays at 5.76.',
        },
        {
          kind: 'table',
          caption: 'Ratios per district (raw = without shrinkage).',
          columns: ['District', 'Raw ratio', 'Used ratio'],
          align: ['left', 'right', 'right'],
          rows: [
            ['Kubu Raya', '8.48', '8.28'],
            ['Sambas', '7.75', '7.50'],
            ['Kayong Utara', '7.35', '7.12'],
            ['Mempawah', '7.30', '7.05'],
            ['Kota Singkawang', '7.75', '6.08'],
            ['Kota Pontianak', '17.83', '5.99'],
            ['Bengkayang', '5.81', '5.77'],
            ['Ketapang', '5.77', '5.76'],
            ['Sanggau', '5.01', '5.01'],
            ['Landak', '4.85', '4.87'],
            ['Sekadau', '4.54', '4.57'],
            ['Melawi', '4.38', '4.42'],
            ['Kapuas Hulu', '4.16', '4.20'],
            ['Sintang', '3.83', '3.86'],
          ],
        },
      ],
    },
    {
      id: 'series',
      heading: 'One harmonized series',
      blocks: [
        {
          kind: 'text',
          text: 'Before NOAA-20 exists we scale Aqua by the district ratio. From April 2018 we use NOAA-20 directly, so recent months are real observations, not estimates:',
        },
        {
          kind: 'math',
          tex: String.raw`H_{d,t} \;=\; \begin{cases} r_d \cdot A_{d,t}, & t < \text{2018-04} \\[4pt] N_{d,t}, & t \ge \text{2018-04} \end{cases}`,
        },
        {
          kind: 'text',
          text: 'The series starts in July 2002, the first full month of Aqua. Months before that are Terra-only and are left out of the harmonized series. The province value is the sum of its districts, $H_{\\text{prov},t} = \\sum_d H_{d,t}$.',
        },
      ],
    },
    {
      id: 'check',
      heading: 'Does the ratio hold up?',
      blocks: [
        {
          kind: 'text',
          text: 'We test the ratio with **leave-one-year-out**. For each overlap year $y$, we estimate $r_d$ from the other years only, predict that year’s NOAA-20 count from Aqua, and measure the error:',
        },
        {
          kind: 'math',
          tex: String.raw`e_{d,y} \;=\; \frac{\left|\, r_d^{(-y)} A_{d,y} - N_{d,y} \,\right|}{N_{d,y}}`,
        },
        {
          kind: 'table',
          columns: ['Method', 'Median error'],
          align: ['left', 'right'],
          rows: [
            ['District ratio with shrinkage (used)', '19.6%'],
            ['One province ratio for all districts', '27.6%'],
            ['Intensity-dependent log–log fit (tested, rejected)', '32%'],
          ],
        },
        {
          kind: 'text',
          text: 'The district ratio is clearly better than one ratio for all. A more flexible model that lets the ratio change with fire intensity did worse, so we kept the simple version.',
        },
      ],
    },
  ],
};

const baselineAnomaly: DocArticle = {
  id: 'baseline-anomaly',
  group: 'Data & Statistics',
  label: 'Baseline & anomaly',
  title: 'Normal, anomaly ratio and classes',
  summary:
    'A count is only useful next to a fair “normal”. For each district and calendar month we compute a normal from 2003–2025, then express the month as a ratio to that normal and put it in one of six classes.',
  sources: ['data-harmonization/pipeline/step3_anomaly_sipongi_export.py'],
  sections: [
    {
      id: 'normal',
      heading: 'Leave-one-year-out normal',
      blocks: [
        {
          kind: 'text',
          text: 'The normal for district $d$, calendar month $m$ and year $y$ is the mean of the same month in all other baseline years. Leaving the year itself out stops a big fire year from raising its own normal and hiding its anomaly.',
        },
        {
          kind: 'math',
          tex: String.raw`\bar{H}_{d,m}^{(-y)} \;=\; \frac{1}{|\mathcal{Y}\setminus\{y\}|} \sum_{y' \in \mathcal{Y},\; y' \neq y} H_{d,m,y'}, \qquad \mathcal{Y} = \{2003, \dots, 2025\}`,
        },
        {
          kind: 'text',
          text: 'Years outside the baseline (such as 2026) simply use the mean of all 23 baseline years.',
        },
      ],
    },
    {
      id: 'ratio',
      heading: 'Anomaly ratio',
      blocks: [
        {
          kind: 'text',
          text: 'We divide the month by its normal. A small constant $c = 5$ is added to both parts so that tiny numbers (for example 2 hotspots against a normal of 0.4) do not produce a huge, meaningless ratio:',
        },
        {
          kind: 'math',
          tex: String.raw`a_{d,m,y} \;=\; \frac{H_{d,m,y} + c}{\bar{H}_{d,m}^{(-y)} + c}, \qquad c = 5`,
        },
        {
          kind: 'text',
          text: 'The current month is not finished. To keep the comparison fair, its normal is scaled by the share of days already covered ($n$ of $D_m$ days):',
        },
        {
          kind: 'math',
          tex: String.raw`\bar{H}_{\text{partial}} \;=\; \bar{H}_{d,m} \cdot \frac{n}{D_m}`,
        },
      ],
    },
    {
      id: 'classes',
      heading: 'Six classes',
      blocks: [
        {
          kind: 'table',
          columns: ['Class', 'Label', 'Ratio a'],
          align: ['left', 'left', 'right'],
          rows: [
            ['−2', 'Much below normal', '< 0.33×'],
            ['−1', 'Below normal', '0.33 – 0.67×'],
            ['0', 'Near normal', '0.67 – 1.5×'],
            ['1', 'Above normal', '1.5 – 3×'],
            ['2', 'Well above normal', '3 – 6×'],
            ['3', 'Extreme', '> 6×'],
          ],
        },
        {
          kind: 'text',
          text: 'The thresholds are symmetric on a log scale ($0.67 \\approx 1/1.5$, $0.33 \\approx 1/3$), so “twice as many” and “half as many” are treated as equally far from normal.',
        },
      ],
    },
    {
      id: 'examples',
      heading: 'What this reveals',
      blocks: [
        {
          kind: 'list',
          items: [
            '**Ketapang, October 2026:** 8.1× its normal, class “extreme”. October is usually the tail of the season; this year it was not.',
            '**Kayong Utara, July 2026:** 8.3× normal while the province as a whole was only 1.4×. A province total would have hidden this district.',
          ],
        },
        {
          kind: 'text',
          text: 'These are exactly the cases where raw counts mislead: a big district can look “high” every year, while a small district’s real outbreak looks like a small number.',
        },
      ],
    },
  ],
};

const validation: DocArticle = {
  id: 'validation',
  group: 'Data & Statistics',
  label: 'Validation with SiPongi',
  title: 'Checking against SiPongi burned area',
  summary:
    'Hotspots are detections of heat, not burned area. We compare the harmonized series with SiPongi’s indicative burned area to check that both rank years and districts the same way.',
  sources: ['data-harmonization/data/web/sipongi.json'],
  sections: [
    {
      id: 'method',
      heading: 'Rank correlation',
      blocks: [
        {
          kind: 'text',
          text: 'The two measures have different units and different biases, so we only ask whether they **rank** the same. We use Spearman’s correlation: rank both series, then take the ordinary correlation of the ranks.',
        },
        {
          kind: 'math',
          tex: String.raw`\rho \;=\; \operatorname{corr}\!\big(\operatorname{rank}(H_{y}),\; \operatorname{rank}(B_{y})\big)`,
          caption: 'H = yearly harmonized hotspots, B = yearly SiPongi burned area (ha).',
        },
      ],
    },
    {
      id: 'results',
      heading: 'Results',
      blocks: [
        {
          kind: 'table',
          columns: ['Level', 'Period', 'Spearman ρ'],
          align: ['left', 'left', 'right'],
          rows: [
            ['Province, yearly', '2016–2025', '0.90'],
            ['District-years (all districts pooled)', '2016–2025', '0.62'],
          ],
        },
        {
          kind: 'text',
          text: 'At province level the agreement is strong. At district level it is moderate, which is expected: SiPongi area is indicative, and the area burned per hotspot differs between landscapes.',
        },
      ],
    },
    {
      id: 'flags',
      heading: 'Flags and the peat effect',
      blocks: [
        {
          kind: 'text',
          text: 'Each district has its own usual ratio of burned area to hotspots. We flag a district-year when it is far from **that district’s own** usual level, rather than from the province average. This avoids flagging a district every year just because its landscape is different.',
        },
        {
          kind: 'text',
          text: 'Peat districts (Kayong Utara, Kubu Raya, Sambas, Ketapang) show more burned area per hotspot. Peat fires spread slowly below the surface and are seen fewer times by satellites for the area they burn.',
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* FORECAST MODEL                                                      */
/* ------------------------------------------------------------------ */

const edaToModel: DocArticle = {
  id: 'eda-to-model',
  group: 'Forecast Model',
  label: 'From EDA to model choice',
  title: 'From EDA to model choice',
  summary:
    'The model was chosen from what the data looks like, not the other way round. Each EDA finding rules some options in and others out, which leads to a Negative Binomial regression as the main model.',
  sources: ['data-harmonization/notebooks/eda.ipynb', 'data-harmonization/EDA.md'],
  sections: [
    {
      id: 'findings',
      heading: 'Each finding and what it implies',
      blocks: [
        {
          kind: 'table',
          columns: ['EDA finding', 'What it means for the model'],
          rows: [
            ['Counts, heavy tails, variance ≫ mean', 'Use a count model that allows extra spread: Negative Binomial, not Poisson or plain linear regression.'],
            ['78% / 57% zero months in the two cities', 'Do not fit Kota Pontianak and Kota Singkawang on their own; keep them only in the province total.'],
            ['Strong, stable season', 'Start from each district’s normal for that month (a climatology offset) and model departures from it.'],
            ['9× swings between years', 'The normal alone is not enough; the model needs inputs that change from year to year.'],
            ['ENSO useful only 0–2 months ahead', 'Use observed Niño 3.4 at lag 1, only in the dry season. Keep the horizon to one month.'],
            ['Memory of 1–2 months', 'Last month’s and the month before’s anomaly are enough. Long input windows add noise.'],
            ['Districts move together (r = 0.66)', 'Fit one pooled model for all districts, with district-specific normals.'],
          ],
        },
      ],
    },
    {
      id: 'figures',
      heading: 'Supporting figures',
      blocks: [
        {
          kind: 'figure',
          src: FIG('eda_3_enso.png'),
          alt: 'Correlation between Niño 3.4 and fire-season hotspots by lead time',
          caption: 'ENSO correlation rises as the season approaches and is close to zero more than 3 months ahead.',
        },
        {
          kind: 'figure',
          src: FIG('eda_4_district_corr.png'),
          alt: 'Correlation matrix of annual hotspot totals between districts',
          caption: 'Districts tend to have big and small years together, which supports one pooled model.',
        },
      ],
    },
    {
      id: 'candidates',
      heading: 'Models compared',
      blocks: [
        {
          kind: 'table',
          columns: ['Model', 'Type', 'Why it is included'],
          rows: [
            ['Climatology median', 'Descriptive statistics', 'Baseline: “this month will be like the usual month”'],
            ['Persistence', 'Naive', 'Baseline: “next month equals this month”'],
            ['Negative Binomial regression', 'Statistical count model', 'Main model, follows directly from the EDA'],
            ['LSTM (3-month window, 8 units)', 'Small neural network', 'Experimental, requested as a deep-learning comparison'],
          ],
        },
        {
          kind: 'text',
          text: 'A model is only worth showing if it beats the two baselines. Climatology is the hard one to beat, because the season is so regular.',
        },
      ],
    },
  ],
};

const preprocessing: DocArticle = {
  id: 'preprocessing',
  group: 'Forecast Model',
  label: 'Preprocessing',
  title: 'Preprocessing and features',
  summary:
    'Every input is something already known at the time of the forecast. Normals are computed from training years only, so no information from the test period leaks into the model.',
  sources: ['data-harmonization/pipeline/forecast_lib.py', 'data-harmonization/notebooks/modeling.ipynb'],
  sections: [
    {
      id: 'target',
      heading: 'Target and series',
      blocks: [
        {
          kind: 'list',
          items: [
            'Target $y_{d,t}$: harmonized hotspots (NOAA-20 equivalent) for district $d$ in month $t$, rounded to an integer.',
            '12 districts are modeled. Kota Pontianak and Kota Singkawang are left out as separate series (too many zero months).',
            'The province forecast is the sum of the 12 district forecasts.',
          ],
        },
      ],
    },
    {
      id: 'features',
      heading: 'Features',
      blocks: [
        {
          kind: 'text',
          text: 'From the training years we compute, for each district and calendar month, the mean count $\\mu^{\\text{clim}}_{d,m}$ and the mean of $\\log(1+H)$, written $\\ell_{d,m}$. The model offset is the log of the normal:',
        },
        {
          kind: 'math',
          tex: String.raw`o_{d,t} \;=\; \log\!\left(\mu^{\text{clim}}_{d,m(t)} + 0.5\right)`,
        },
        {
          kind: 'text',
          text: 'The anomaly of a past month is how far its log count is from the usual log count for that month. We use the last two months:',
        },
        {
          kind: 'math',
          tex: String.raw`z_{d,t-j} \;=\; \log\!\left(1 + H_{d,t-j}\right) \;-\; \ell_{d,\,m(t-j)}, \qquad j = 1, 2`,
        },
        {
          kind: 'list',
          items: [
            '$\\text{dry}_t = 1$ for June–October, else 0.',
            '$\\text{ENSO}_{t-1}$: Niño 3.4 anomaly of the previous month, used only through $\\text{ENSO}_{t-1} \\times \\text{dry}_t$.',
            '$z_{t-1} \\times \\text{dry}_t$: lets last month’s anomaly matter more during the fire season.',
          ],
        },
        {
          kind: 'text',
          text: 'The final set of terms was chosen on a 2019–2020 validation window, before looking at any test year.',
        },
      ],
    },
    {
      id: 'splits',
      heading: 'Splits',
      blocks: [
        {
          kind: 'table',
          columns: ['Stage', 'Train', 'Test', 'Purpose'],
          rows: [
            ['A', '2002-10 → 2020-12', '2021-01 → 2025-12', 'Recent years: does the model beat the baselines?'],
            ['B', '2002-10 → 2025-12', '2026-01 → 2026-10', 'An extreme year the model has never seen'],
            ['Inference', '2002-10 → 2026-10', '2026-11', 'The live outlook shown to users'],
          ],
        },
        {
          kind: 'text',
          text: 'Training starts in October 2002 because each row needs three months of history. The LSTM inputs are a 3-month window of scaled $\\log(1+H)$ and anomalies; its target is the log departure from the normal.',
        },
      ],
    },
  ],
};

const training: DocArticle = {
  id: 'training',
  group: 'Forecast Model',
  label: 'Training & results',
  title: 'Training and results',
  summary:
    'The Negative Binomial model beats both baselines on the 2021–2025 test. In the extreme 2026 season every model under-predicts the peak, but the Negative Binomial range still contains most actual values.',
  sources: ['data-harmonization/pipeline/forecast_lib.py', 'data-harmonization/notebooks/modeling.ipynb'],
  sections: [
    {
      id: 'nb',
      heading: 'The Negative Binomial model',
      blocks: [
        {
          kind: 'text',
          text: 'The count is modeled as Negative Binomial. Its variance grows faster than the mean, which matches the heavy tails seen in the EDA:',
        },
        {
          kind: 'math',
          tex: String.raw`y_{d,t} \sim \operatorname{NB}(\mu_{d,t},\,\alpha), \qquad \operatorname{Var}(y_{d,t}) = \mu_{d,t} + \alpha\,\mu_{d,t}^{2}`,
        },
        {
          kind: 'math',
          tex: String.raw`\log \mu_{d,t} = o_{d,t} + \beta_0 + \beta_1\,\text{dry}_t + \beta_2\,\text{ENSO}_{t-1}\text{dry}_t + \beta_3\,z_{d,t-1} + \beta_4\,z_{d,t-2} + \beta_5\,z_{d,t-1}\text{dry}_t`,
        },
        {
          kind: 'text',
          text: 'It is fitted by maximum likelihood with `statsmodels`. Because of the offset, the model starts from the normal and only learns how much to move up or down from it.',
        },
      ],
    },
    {
      id: 'effects',
      heading: 'What the model learned',
      blocks: [
        {
          kind: 'table',
          caption: 'Fitted effects as multipliers, exp(β), on the final model.',
          columns: ['Term', 'Multiplier', 'Plain meaning'],
          align: ['left', 'right', 'left'],
          rows: [
            ['z (t−1)', '1.19', 'One unit higher log-anomaly last month → about 19% more expected hotspots'],
            ['z (t−1) × dry', '1.08', 'In the dry season this becomes about 1.19 × 1.08 ≈ 1.28'],
            ['z (t−2)', '1.10', 'Two months ago still adds a little'],
            ['ENSO (t−1) × dry', '1.05', '+1 °C Niño 3.4 → about 5% more in the dry season'],
            ['dry', '1.02', 'Almost no extra effect; the normal already carries the season'],
          ],
        },
        {
          kind: 'text',
          text: 'Recent anomalies matter most. ENSO is small once last month is known, because last month already reflects the dry conditions ENSO causes.',
        },
      ],
    },
    {
      id: 'outputs',
      heading: 'From distribution to forecast',
      blocks: [
        {
          kind: 'text',
          text: 'The model gives a full distribution, not just one number. We report three things from it:',
        },
        {
          kind: 'list',
          items: [
            '**Point forecast:** the median. For skewed counts the median is lower and more stable than the mean.',
            '**Range:** the 10th to 90th percentile. In 8 of 10 cases the actual value should fall inside.',
            '**Chance of above normal:** the probability that the count exceeds the class-1 threshold of the calendar.',
          ],
        },
        {
          kind: 'math',
          tex: String.raw`P(\text{above normal}) = P\!\left(y_{d,t} > \tau_{d,m}\right), \qquad \tau_{d,m} = 1.5\,(\mu^{\text{clim}}_{d,m} + 5) - 5`,
        },
      ],
    },
    {
      id: 'metrics',
      heading: 'Metrics',
      blocks: [
        {
          kind: 'math',
          tex: String.raw`\text{MAE} = \frac{1}{n}\sum |\hat{y} - y|, \qquad \text{log-MAE} = \frac{1}{n}\sum \big|\log(1+\hat{y}) - \log(1+y)\big|, \qquad \text{Brier} = \frac{1}{n}\sum (p - o)^2`,
          caption: 'o = 1 if the month was actually above normal, else 0. Lower is better for all three.',
        },
        {
          kind: 'text',
          text: 'MAE is dominated by big months; log-MAE treats small and big districts more equally; the Brier score checks the probability.',
        },
      ],
    },
    {
      id: 'stage-a',
      heading: 'Stage A — test 2021–2025',
      blocks: [
        {
          kind: 'table',
          columns: ['Model', 'MAE', 'MAE Jul–Oct', 'log-MAE', 'Province MAE', 'Brier'],
          align: ['left', 'right', 'right', 'right', 'right', 'right'],
          rows: [
            ['Negative Binomial', '87.4', '227.6', '0.985', '856', '0.135'],
            ['Climatology median', '132.3', '360.6', '1.151', '1,317', '0.148'],
            ['Persistence', '132.2', '343.5', '1.253', '1,402', '—'],
            ['LSTM (experimental)', '148.2', '410.0', '0.996', '1,633', '0.138'],
          ],
        },
        {
          kind: 'text',
          text: 'The Negative Binomial model cuts the error by about a third against climatology, and the gain holds in the fire season and at province level. Its 10–90% range contained the actual value **92%** of the time.',
        },
      ],
    },
    {
      id: 'stage-b',
      heading: 'Stage B — test January–October 2026',
      blocks: [
        {
          kind: 'table',
          columns: ['Model', 'MAE', 'MAE Jul–Oct', 'log-MAE', 'Brier'],
          align: ['left', 'right', 'right', 'right', 'right'],
          rows: [
            ['Negative Binomial', '497.6', '1,174.9', '1.090', '0.237'],
            ['Climatology median', '512.3', '1,211.0', '1.230', '0.267'],
            ['Persistence', '587.8', '1,362.0', '1.725', '—'],
            ['LSTM (experimental)', '510.3', '1,208.9', '1.096', '0.250'],
          ],
        },
        {
          kind: 'callout',
          tone: 'warn',
          title: 'All models under-predict the 2026 peak',
          text: 'For the province in August 2026 the actual count was 37,034; the Negative Binomial median was 10,841 (range 418–62,465). The point forecast is far too low, but the actual value is inside the range, and the range still covered 82% of 2026 months (90% in July–October). For extreme seasons, read the range and the probability, not the point.',
        },
      ],
    },
    {
      id: 'lstm',
      heading: 'LSTM learning curve',
      blocks: [
        {
          kind: 'figure',
          src: FIG('lstm_learning_curves.png'),
          alt: 'LSTM training and validation loss by epoch',
          caption: 'Training loss keeps falling while validation loss flattens and test loss rises again: a clear sign of overfitting.',
        },
        {
          kind: 'text',
          text: 'The LSTM is written in numpy (PyTorch was not available in our environment) and passes a gradient check. Its validation loss is best around epoch 245, but test loss is lowest earlier, around epochs 100–175. At the epoch picked by validation it is only about as good as climatology. With roughly 290 months per district there is not enough data for it to beat a model built on the EDA, so it stays experimental.',
        },
      ],
    },
  ],
};

const inference: DocArticle = {
  id: 'inference',
  group: 'Forecast Model',
  label: 'Inference: Nov 2026',
  title: 'Inference: outlook for November 2026',
  summary:
    'The final model is retrained on all data through October 2026 and forecasts November 2026. November is the end of the season, so counts are expected to be low; the useful signal is which districts have a higher chance than usual of staying above normal.',
  sources: ['data-harmonization/data/web/forecast.json', 'data-harmonization/pipeline/step6_forecast.py'],
  sections: [
    {
      id: 'table',
      heading: 'Forecast by district',
      blocks: [
        {
          kind: 'table',
          caption: 'Negative Binomial median and 10–90% range, with the chance of above normal from the model and from history alone (climatology).',
          columns: ['Region', 'Median', 'Range (10–90%)', 'P(above) model', 'P(above) history'],
          align: ['left', 'right', 'right', 'right', 'right'],
          rows: [
            ['West Kalimantan (sum)', '155', '5 – 899', '—', '—'],
            ['Ketapang', '131', '5 – 740', '0.36', '0.17'],
            ['Melawi', '2', '0 – 15', '0.24', '0.13'],
            ['Kayong Utara', '1', '0 – 9', '0.21', '0.21'],
            ['Sintang', '3', '0 – 21', '0.20', '0.13'],
            ['Sanggau', '3', '0 – 20', '0.18', '0.13'],
            ['Kubu Raya', '2', '0 – 14', '0.16', '0.17'],
            ['Kapuas Hulu', '2', '0 – 10', '0.16', '0.13'],
            ['Sambas', '5', '0 – 29', '0.16', '0.17'],
            ['Landak', '2', '0 – 15', '0.14', '0.21'],
            ['Sekadau', '1', '0 – 6', '0.13', '0.08'],
            ['Mempawah', '1', '0 – 8', '0.13', '0.17'],
            ['Bengkayang', '2', '0 – 12', '0.12', '0.17'],
          ],
        },
      ],
    },
    {
      id: 'reading',
      heading: 'How to read it',
      blocks: [
        {
          kind: 'list',
          items: [
            '**Ketapang stands out.** October was 8.1× its normal, so the model gives it about twice the usual chance (0.36 vs 0.17) of an above-normal November.',
            '**Most districts are close to history.** Their chances are within a few points of the climatology value, so there is no strong signal either way.',
            '**The province range is wide (5–899).** It is an approximate sum of district bounds, so treat it as a rough envelope.',
            'Kota Pontianak and Kota Singkawang have no separate forecast; they are covered by the province total only.',
          ],
        },
      ],
    },
    {
      id: 'json',
      heading: 'How it reaches the website',
      blocks: [
        {
          kind: 'text',
          text: 'Step 6 writes the pre-computed medians, ranges, and probabilities to `data-harmonization/data/web/forecast.json`. When a forecast view is wired into the frontend, it will only read and display those numbers; no model needs to run in the browser (the live web UI currently shows the historical calendar, ranking, and SiPongi views only).',
        },
        {
          kind: 'code',
          title: 'forecast.json (excerpt)',
          code: `{
  "target_month": "2026-11",
  "trained_through": "2026-10",
  "main_model": "nb",
  "interval": "10th-90th percentile",
  "by_region": {
    "ketapang": {
      "nb": 131, "nb_low": 5, "nb_high": 740,
      "p_above_normal": 0.361,
      "p_above_normal_climatology": 0.167
    }
  }
}`,
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* ROADMAP                                                             */
/* ------------------------------------------------------------------ */

const roadmap: DocArticle = {
  id: 'roadmap',
  group: 'Roadmap',
  label: 'Robust for other cases',
  title: 'Making the pipeline robust for other cases',
  summary:
    'The current version is built and checked for one province. These are the steps to make the same pipeline run reliably for other regions, more sensors and longer periods, without rewriting the method.',
  sources: ['data-harmonization/pipeline/config.py'],
  sections: [
    {
      id: 'region',
      heading: '1. Region as configuration',
      blocks: [
        {
          kind: 'text',
          text: 'Today the box, district list and time zone are constants in `config.py`. The next step is one config file per region, so a new province (for example Central Kalimantan, Riau or South Sumatra) needs a new file, not new code.',
        },
        {
          kind: 'code',
          title: 'regions/kalimantan-tengah.yaml (proposed)',
          code: `name: Kalimantan Tengah
bbox: [W, S, E, N]               # region box in degrees
boundaries: geoBoundaries-IDN-ADM2
timezone_offset_hours: 7
baseline_years: [2003, 2025]
shrinkage_k: 100
validation: sipongi`,
        },
      ],
    },
    {
      id: 'calibration',
      heading: '2. Calibrate and check per region',
      blocks: [
        {
          kind: 'list',
          items: [
            'Re-estimate $R$ and every $r_d$ from that region’s own overlap; never reuse West Kalimantan ratios.',
            'Run the leave-one-year-out check automatically and write the error into `meta.json`.',
            'Fall back to the province ratio for any district whose error is worse than the single-ratio error.',
            'Tune $k$ on the region’s data instead of fixing it at 100.',
          ],
        },
      ],
    },
    {
      id: 'sensors',
      heading: '3. More sensors, longer overlap',
      blocks: [
        {
          kind: 'list',
          items: [
            'Add **VIIRS S-NPP** (2012–2026) to lengthen the VIIRS record and give a second overlap with Aqua.',
            'Add **VIIRS NOAA-21** and cross-calibrate it to NOAA-20, so the reference continues if NOAA-20 stops.',
            'Plan for the end of MODIS: once Aqua stops, the harmonized series simply continues on VIIRS.',
          ],
        },
      ],
    },
    {
      id: 'automation',
      heading: '4. Automatic monthly updates',
      blocks: [
        {
          kind: 'list',
          items: [
            'Download new data from the FIRMS API with a MAP_KEY instead of manual files.',
            'Run the pipeline on a schedule (for example a monthly GitHub Action) and publish the JSON with the site.',
            'Validate each JSON file against a schema before publishing, so a broken run never reaches users.',
            'Keep the date the data runs to in every file, and show it in the UI.',
          ],
        },
      ],
    },
    {
      id: 'model',
      heading: '5. A better forecast',
      blocks: [
        {
          kind: 'list',
          items: [
            'Add rainfall (for example NASA GPM IMERG or NASA POWER) and soil moisture, which act faster than ENSO.',
            'Add a peat map so peat and non-peat areas can have different effects.',
            'Re-check the forecast range after extreme seasons like 2026 and widen it if coverage drops.',
            'Try a hierarchical model that shares strength between districts and regions.',
          ],
        },
      ],
    },
    {
      id: 'tests',
      heading: '6. Tests and reproducibility',
      blocks: [
        {
          kind: 'list',
          items: [
            'Unit tests for the ratio, normal, anomaly ratio and class thresholds.',
            'A small fixed test dataset with known outputs, run on every change.',
            'Re-execute the notebooks in CI so the documentation never drifts from the code.',
            'Pin package versions in `requirements.txt`.',
          ],
        },
      ],
    },
    {
      id: 'web-integration',
      heading: '7. Web UI integration',
      blocks: [
        {
          kind: 'list',
          items: [
            'Copy `forecast.json` into `frontend/public/data/` and add a one-month outlook card showing the median, 10th–90th percentile band, and probability above normal.',
            'Build an interactive district map on `/calendar` using the GeoJSON files already exported to `points/`.',
          ],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* REFERENCE                                                           */
/* ------------------------------------------------------------------ */

const limitations: DocArticle = {
  id: 'limitations',
  group: 'Reference',
  label: 'Limitations',
  title: 'Limitations',
  summary: 'What the numbers can and cannot tell you.',
  sections: [
    {
      id: 'list',
      heading: 'Known limits',
      blocks: [
        {
          kind: 'list',
          items: [
            'Hotspots are heat detections, not burned area or fire count. Clouds and smoke can hide fires.',
            'Before April 2018 the series is an estimate (Aqua × ratio). Errors of about 20% per district-year are normal.',
            'Months before July 2002 are Terra-only and are not harmonized.',
            'The current month is partial; its normal is scaled by days covered, but late-month fires are not yet counted.',
            'The forecast is one month ahead only, and it under-predicts extreme seasons. Use the range and probability.',
            'The LSTM is experimental and is not used as the main forecast.',
            'SiPongi burned area is indicative and can be revised.',
          ],
        },
      ],
    },
  ],
};

const references: DocArticle = {
  id: 'references',
  group: 'Reference',
  label: 'Data & references',
  title: 'Data and references',
  summary: 'Where every dataset comes from, and the study cited on these pages.',
  sections: [
    {
      id: 'data',
      heading: 'Datasets',
      blocks: [
        {
          kind: 'links',
          items: [
            { label: 'NASA FIRMS — MODIS C6.1 and VIIRS C2 active fire data', href: 'https://firms.modaps.eosdis.nasa.gov/', note: 'Core data (NASA)' },
            { label: 'NOAA PSL — Niño 3.4 monthly anomaly', href: 'https://psl.noaa.gov/data/correlation/nina34.anom.data', note: 'Forecast input' },
            { label: 'SiPongi — Indonesian forest and land fire monitoring', href: 'https://sipongi.menlhk.go.id/', note: 'Validation' },
            { label: 'geoBoundaries — IDN ADM2', href: 'https://www.geoboundaries.org/', note: 'District boundaries' },
          ],
        },
      ],
    },
    {
      id: 'papers',
      heading: 'Studies',
      blocks: [
        {
          kind: 'links',
          items: [
            {
              label: 'Zahra et al. (2023), Quaestiones Geographicae — ENSO and hotspots in Kalimantan',
              href: 'https://reference-global.com/article/10.14746/quageo-2023-0006',
            },
          ],
        },
      ],
    },
  ],
};

export const DOC_GROUPS: DocGroup[] = [
  { title: 'Validation', items: [calibrationValidation] },
  { title: 'About', items: [whatIsNiskala, whyKalbar] },
  {
    title: 'Data & Statistics',
    items: [pipelineProcess, dataSources, harmonization, baselineAnomaly, validation],
  },
  { title: 'Forecast Model', items: [edaToModel, preprocessing, training, inference] },
  { title: 'Roadmap', items: [roadmap] },
  { title: 'Reference', items: [limitations, references] },
];

export const ALL_DOC_ARTICLES: DocArticle[] = DOC_GROUPS.flatMap((group) => group.items);
