export const GITHUB_REPO_URL = 'https://github.com/sulthonaw/niskala';

export interface DocStep {
  step: string;
  heading: string;
  description: string;
  codeTitle?: string;
  code?: string;
}

export interface DocSubTab {
  id: string;
  label: string;
  intro: string;
  steps: DocStep[];
}

export interface DocArticle {
  id: string;
  group: string;
  label: string;
  title: string;
  summary: string;
  subTabs?: DocSubTab[];
  steps?: DocStep[];
  templateNote?: string;
}

export interface DocGroup {
  title: string;
  items: DocArticle[];
}

export const DOC_GROUPS: DocGroup[] = [
  {
    title: 'GETTING STARTED',
    items: [
      {
        id: 'overview',
        group: 'GETTING STARTED',
        label: 'Overview',
        title: 'Get started with NISKALA',
        summary:
          'NISKALA harmonizes multi-decade MODIS and VIIRS thermal anomaly records into a single NOAA-20-equivalent scale for West Kalimantan fire readiness.',
        subTabs: [
          {
            id: 'architecture',
            label: 'Architecture',
            intro:
              'Pre-computed Python pipeline outputs feed a static React + TypeScript telemetry interface.',
            steps: [
              {
                step: '01',
                heading: 'Ingest FIRMS & SiPongi archives',
                description:
                  'Monthly detections from MODIS Terra/Aqua (1 km) and VIIRS NOAA-20 (375 m) are aggregated across West Kalimantan and all 14 regencies.',
                codeTitle: 'Data Flow',
                code: 'FIRMS CSV (2002–2026) -> Harmonize -> LOYO Baseline -> niskala_data.json',
              },
              {
                step: '02',
                heading: 'Inspect 311 calibrated month cells',
                description:
                  'Open the Anomaly Calendar to answer when peak seasons occur, how anomalous any month is, and which regency leads risk.',
                codeTitle: 'Deep Link Example',
                code: '/calendar?region=ketapang&focus=2026-10',
              },
            ],
          },
          {
            id: 'quick-links',
            label: 'Navigation',
            intro: 'Template section — customize route links or onboarding notes here.',
            steps: [
              {
                step: '01',
                heading: 'Landing & Decision Calendar',
                description:
                  'Use / for the planetary overview and /calendar for district ranking and monthly anomaly inspection.',
                codeTitle: 'Primary Routes',
                code: '/            -> Planetary Hero\n/calendar    -> Anomaly Calendar & District Ranking\n/catalog     -> Calibration Matrix\n/docs        -> Documentation Template',
              },
            ],
          },
        ],
        templateNote:
          'Template placeholder: replace or expand overview copy in src/constants/docsSections.ts.',
      },
      {
        id: 'quickstart',
        group: 'GETTING STARTED',
        label: 'Local Setup',
        title: 'Running NISKALA locally',
        summary:
          'Clone the GitHub repository and start the frontend dev server or regenerate harmonized datasets.',
        subTabs: [
          {
            id: 'frontend',
            label: 'Frontend (Vite)',
            intro: 'Install dependencies with Bun and launch the TypeScript Vite client.',
            steps: [
              {
                step: '01',
                heading: 'Clone the repository',
                description:
                  'Pull the Niskala source tree directly from GitHub before installing frontend packages.',
                codeTitle: 'Terminal',
                code: 'git clone https://github.com/sulthonaw/niskala.git\ncd niskala/frontend',
              },
              {
                step: '02',
                heading: 'Install & run dev server',
                description:
                  'Run lint checks, typecheck, or preview production bundles cleanly.',
                codeTitle: 'Terminal',
                code: 'bun install\nbun run dev',
              },
            ],
          },
          {
            id: 'pipeline',
            label: 'Data Pipeline',
            intro: 'Template instructions for regenerating pre-computed JSON payloads.',
            steps: [
              {
                step: '01',
                heading: 'Run harmonization scripts',
                description:
                  'Execute the data processing pipeline and emit updated JSON artifacts into frontend/public/data/.',
                codeTitle: 'Terminal',
                code: '# Add pipeline command template here\npython pipeline/build_niskala_data.py',
              },
            ],
          },
        ],
      },
      {
        id: 'changelog',
        group: 'GETTING STARTED',
        label: 'Release Notes',
        title: 'Versioning & release notes',
        summary:
          'Template page for tracking dataset refreshes, FIRMS archive cutoffs, and calibration updates.',
        steps: [
          {
            step: '01',
            heading: 'Archive coverage through 2026-11-13',
            description:
              'Document monthly ingestion updates, partial-month coverage notes, and calibration adjustments here.',
            codeTitle: 'Metadata Stamp',
            code: 'archive_through: "2026-11-13"\nbaseline_window: "2003–2025 LOYO"',
          },
        ],
        templateNote:
          'Template placeholder: add milestone entries and NASA Space Apps submission notes here.',
      },
    ],
  },
  {
    title: 'CORE CONCEPTS',
    items: [
      {
        id: 'harmonization',
        group: 'CORE CONCEPTS',
        label: 'Sensor Harmonization',
        title: 'Cross-sensor calibration formula',
        summary:
          'Reconciles legacy MODIS Aqua observations onto the higher-resolution VIIRS NOAA-20 scale using empirical district shrinkage ratios.',
        steps: [
          {
            step: '01',
            heading: 'Overlap calibration window',
            description:
              'Paired MODIS Aqua and VIIRS NOAA-20 counts from 2018-04 through 2025-12 establish district-specific scaling factors.',
            codeTitle: 'Harmonization Rule',
            code: 'H = Aqua * r_district   # before 2018-04\nH = NOAA-20             # from 2018-04 onward',
          },
          {
            step: '02',
            heading: 'Empirical Bayes shrinkage',
            description:
              'Low-count regencies borrow strength toward the provincial ratio to avoid noisy multiplier spikes across historical decades.',
            codeTitle: 'Validation Error (LOYO)',
            code: 'District Ratio Median Error : 19.6%\nSingle Province Ratio Error : (see /catalog)',
          },
        ],
      },
      {
        id: 'baseline',
        group: 'CORE CONCEPTS',
        label: 'LOYO Baseline',
        title: 'Leave-one-year-out seasonal baseline',
        summary:
          'Every calendar month is benchmarked against historical normal activity for the same regency and month across 2003–2025.',
        steps: [
          {
            step: '01',
            heading: 'Anomaly ratio & severity bands',
            description:
              'Observed harmonized hotspots are divided by the LOYO monthly mean to classify conditions across six visual severity classes.',
            codeTitle: 'Classification Bands',
            code: '< 0.33x       -> Much below normal\n0.33x–0.67x   -> Below normal\n0.67x–1.5x    -> Near normal\n1.5x–3.0x     -> Above normal\n3.0x–6.0x     -> Well above normal\n> 6.0x        -> Extreme anomaly',
          },
        ],
      },
      {
        id: 'validation',
        group: 'CORE CONCEPTS',
        label: 'SiPongi Validation',
        title: 'Official burned-area correlation',
        summary:
          'Evaluates harmonized hotspot trajectories against Ministry of Environment and Forestry (SiPongi) burned-area statistics from 2016–2026.',
        steps: [
          {
            step: '01',
            heading: 'Rank correlation & peat flags',
            description:
              'Provincial Spearman correlation reaches 0.90 across 2016–2025, while divergence flags highlight smoke-obscured peat fires.',
            codeTitle: 'Metrics',
            code: 'Provincial Spearman (2016–2025) : 0.90\nPartial Comparison (2026)       : Jan–Jul only',
          },
        ],
        templateNote:
          'Template placeholder: expand with district-level correlation charts or methodology proofs.',
      },
    ],
  },
  {
    title: 'REFERENCE',
    items: [
      {
        id: 'schema',
        group: 'REFERENCE',
        label: 'Data Schema',
        title: 'Telemetry JSON contract',
        summary:
          'Template schema reference describing the JSON payload consumed by the Niskala frontend.',
        steps: [
          {
            step: '01',
            heading: 'Top-level dataset structure',
            description:
              'All frontend views read meta descriptors, district arrays, monthly cells, and SiPongi series from a single static asset.',
            codeTitle: 'TypeScript Interface',
            code: 'interface NiskalaDataset {\n  meta: MetaData;\n  cells: Record<string, MonthCell[]>;\n  sipongi: Record<string, SipongiRow[]>;\n  annual: Record<string, AnnualRow[]>;\n}',
          },
        ],
        templateNote:
          'Template placeholder: document additional endpoint contracts or CSV export formats here.',
      },
      {
        id: 'limitations',
        group: 'REFERENCE',
        label: 'Limitations & Citations',
        title: 'Known caveats & NASA FIRMS attribution',
        summary:
          'Template reference for sensor cloud/smoke obscuration caveats and required NASA FIRMS citations.',
        steps: [
          {
            step: '01',
            heading: 'Operational caveats',
            description:
              'Thermal detections capture active fire radiative anomalies rather than direct burned area; thick peat smoke can attenuate orbital detections.',
            codeTitle: 'Citation Template',
            code: 'NASA FIRMS (MODIS C6.1 & VIIRS NOAA-20 NRT) · West Kalimantan (2002–2026)',
          },
        ],
      },
    ],
  },
];

export const ALL_DOC_ARTICLES: DocArticle[] = DOC_GROUPS.flatMap((g) => g.items);
