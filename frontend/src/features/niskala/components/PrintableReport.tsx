import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  CLASS_COLOR,
  CLASS_LEGEND_ITEMS,
  CLASS_SHORT_LABEL,
  MONTH_SHORT_NAMES,
} from '../../../constants/anomalyColors';
import { formatPeakMonths, formatYmLabel } from '../../../services/niskalaDataService';
import type {
  DistrictMeta,
  DistrictRankItem,
  MetaData,
  MonthCell,
  SipongiRow,
} from '../../../types/niskala';

export interface PrintableReportProps {
  meta: MetaData;
  activeDistrict: DistrictMeta;
  fromYm: string;
  toYm: string;
  focusMonth: string;
  focusCell: MonthCell | null;
  rangeCells: MonthCell[];
  topDistrict: DistrictRankItem | null;
  sipongiSeries: SipongiRow[];
}

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : Math.round(n).toLocaleString('en-US');

/**
 * Corporate-letterhead print report rendered into <body>.
 * index.css sets @page margin: 0 (suppressing browser localhost URL footers)
 * and uses repeating table thead/tfoot margin spacers across pages.
 */
export function PrintableReport({
  meta,
  activeDistrict,
  fromYm,
  toYm,
  focusMonth,
  focusCell,
  rangeCells,
  topDistrict,
  sipongiSeries,
}: PrintableReportProps) {
  const years = useMemo(() => {
    const map = new Map<number, (MonthCell | null)[]>();
    for (const c of rangeCells) {
      if (!map.has(c.year)) map.set(c.year, Array.from({ length: 12 }, () => null));
      map.get(c.year)![c.month - 1] = c;
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [rangeCells]);

  const yearly = useMemo(
    () =>
      years
        .map(([year, months]) => {
          const cells = months.filter((c): c is MonthCell => c !== null);
          const harmonized = cells.filter((c) => c.hotspots !== null);
          const peak = harmonized.reduce<MonthCell | null>(
            (best, c) => (best === null || (c.hotspots ?? 0) > (best.hotspots ?? 0) ? c : best),
            null
          );
          return {
            year,
            months: cells.length,
            total: harmonized.length ? harmonized.reduce((s, c) => s + (c.hotspots ?? 0), 0) : null,
            above: harmonized.filter((c) => (c.cls ?? 0) >= 1).length,
            peak: peak ? MONTH_SHORT_NAMES[peak.month - 1] : '—',
            partial: cells.some((c) => c.partial),
          };
        })
        .sort((a, b) => a.year - b.year),
    [years]
  );

  const isProvince = activeDistrict.slug === 'kalimantan-barat';
  const spearman = isProvince
    ? meta.sipongi.spearman_province_2016_2025
    : meta.sipongi.per_district_spearman[activeDistrict.name];
  const flagged = sipongiSeries.filter((r) => r.flag_area_high).map((r) => r.year);
  const generated = meta.generated_local;
  const validation = meta.harmonization.validation_loyo_median_abs_pct_error;
  const documentRef = `NSK-${activeDistrict.slug.toUpperCase()}-${fromYm.replace('-', '')}-${toYm.replace('-', '')}`;

  const report = (
    <div className="niskala-print-report">
      <table className="npr-page-shell">
        <thead>
          <tr>
            <td>
              <div className="npr-page-spacer" />
            </td>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="npr-page-body">
              {/* Niskala Letterhead */}
              <header className="npr-letterhead">
                <div className="npr-brand-lockup">
                  <img
                    src={`${import.meta.env.BASE_URL}favicon-earth.png`}
                    alt="NISKALA"
                    className="npr-brand-logo"
                  />
                  <div>
                    <div className="npr-brand-name">NISKALA</div>
                    <div className="npr-brand-tagline">
                      HARMONIZED HOTSPOT ANOMALY ARCHIVE · WEST KALIMANTAN
                    </div>
                    <div className="npr-brand-sub">
                      Cross-Sensor Satellite Calibration · NASA Space Apps Challenge 2026
                    </div>
                  </div>
                </div>

                <div className="npr-doc-meta">
                  <div>
                    <span>REPORT ID:</span> <strong>{documentRef}</strong>
                  </div>
                  <div>
                    <span>GENERATED:</span> {generated}
                  </div>
                  <div>
                    <span>DATA THROUGH:</span> {meta.data_through_utc} (UTC)
                  </div>
                  <div>
                    <span>SCALE:</span> {meta.harmonization.reference}
                  </div>
                </div>
              </header>

              {/* Document Subject Strip */}
              <div className="npr-subject-bar">
                <div>
                  <div className="npr-eyebrow">Hotspot Anomaly &amp; Calibration Report</div>
                  <h1>{activeDistrict.name}</h1>
                  <p className="npr-muted">
                    Territory: {meta.region} · Reporting Period: {formatYmLabel(fromYm)} –{' '}
                    {formatYmLabel(toYm)} · Focus Month: {formatYmLabel(focusMonth)}
                  </p>
                </div>
              </div>

              {/* Executive Summary Cards */}
              <section className="npr-answers">
                <div>
                  <div className="npr-label">When · Seasonal Peak</div>
                  <div className="npr-value">
                    Normal peak: {formatPeakMonths(activeDistrict.peak_months)}
                  </div>
                </div>
                <div>
                  <div className="npr-label">How bad · {formatYmLabel(focusMonth)}</div>
                  <div className="npr-value">
                    {focusCell && focusCell.ratio !== null && focusCell.cls !== null
                      ? `${focusCell.ratio.toFixed(1)}× normal (${CLASS_SHORT_LABEL[focusCell.cls]})`
                      : 'No data for this month'}
                  </div>
                  {focusCell && focusCell.hotspots !== null && (
                    <div className="npr-muted">
                      {fmt(focusCell.hotspots)} hotspots vs normal {fmt(focusCell.normal)}
                      {focusCell.partial
                        ? ` · in progress (${meta.partial_month.days_covered} days)`
                        : ''}
                    </div>
                  )}
                </div>
                <div>
                  <div className="npr-label">Where · {formatYmLabel(focusMonth)}</div>
                  <div className="npr-value">
                    {topDistrict && !topDistrict.isLowActivity && topDistrict.cell?.ratio != null
                      ? `Highest anomaly: ${topDistrict.district.name} (${topDistrict.cell.ratio.toFixed(1)}×)`
                      : 'No district above 20 hotspots'}
                  </div>
                </div>
              </section>

              {/* Anomaly Calendar */}
              <section>
                <h2>Anomaly Calendar (Ratio to 2003–2025 Normal)</h2>
                <table className="npr-calendar">
                  <thead>
                    <tr>
                      <th />
                      {MONTH_SHORT_NAMES.map((m) => (
                        <th key={m}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {years.map(([year, months]) => (
                      <tr key={year}>
                        <th>{year}</th>
                        {months.map((c, i) => {
                          if (!c) return <td key={i} className="npr-empty" />;
                          if (c.cls === null) return <td key={i} className="npr-nodata">T</td>;
                          const dark = c.cls === -2 || c.cls >= 2;
                          return (
                            <td
                              key={i}
                              className={c.partial ? 'npr-partial' : undefined}
                              style={{
                                backgroundColor: CLASS_COLOR[c.cls],
                                color: dark ? '#fff' : '#111',
                              }}
                            >
                              {c.ratio !== null ? c.ratio.toFixed(1) : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="npr-legend">
                  {CLASS_LEGEND_ITEMS.map((item) => (
                    <span key={item.cls}>
                      <i style={{ backgroundColor: item.color }} />
                      {item.label}
                    </span>
                  ))}
                  <span>
                    <i className="npr-nodata" />T = Terra only, not harmonized
                  </span>
                  <span>Dashed = month in progress</span>
                </div>
              </section>

              {/* Yearly Table */}
              <section className="npr-avoid-break">
                <h2>Yearly Summary in Range</h2>
                <table className="npr-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Months</th>
                      <th>Harmonized hotspots</th>
                      <th>Months above normal</th>
                      <th>Peak month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearly.map((y) => (
                      <tr key={y.year}>
                        <td>
                          {y.year}
                          {y.partial ? '*' : ''}
                        </td>
                        <td>{y.months}</td>
                        <td>{fmt(y.total)}</td>
                        <td>{y.above}</td>
                        <td>{y.peak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="npr-muted">* includes a month still in progress.</p>
              </section>

              {/* Method & Validation */}
              <section className="npr-avoid-break npr-two-col">
                <div>
                  <h2>Calibration Method</h2>
                  <p>
                    Before April 2018, MODIS Aqua counts are multiplied by the district ratio (
                    {activeDistrict.ratio.toFixed(2)} for {activeDistrict.name}) learned from the
                    2018–2025 overlap with VIIRS NOAA-20; from April 2018 NOAA-20 counts are used
                    directly. Each month is compared with the mean of the same month in 2003–2025,
                    leaving out its own year. District calibration error is{' '}
                    {validation.district_ratio}% vs {validation.single_ratio}% with one ratio for
                    all districts.
                  </p>
                </div>
                <div>
                  <h2>Ground Check (SiPongi)</h2>
                  <p>
                    Harmonized hotspots vs SiPongi burned area, 2016–2025: Spearman{' '}
                    {spearman !== undefined ? spearman.toFixed(2) : '—'}.
                    {flagged.length > 0
                      ? ` Burned area higher than hotspots suggest in ${flagged.join(', ')} (possible peat or smoke-hidden fires).`
                      : ' No year flagged for unusually high burned area.'}
                  </p>
                </div>
              </section>

              {/* Limitations */}
              <section className="npr-avoid-break">
                <h2>Limitations &amp; Attribution</h2>
                <ul>
                  {meta.limitations.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
                <p className="npr-muted">Sources: {meta.sources.join(' · ')}</p>
                <p className="npr-muted">{meta.firms_citation}</p>
              </section>

              {/* Clean Corporate Footer (No Localhost / Browser URLs) */}
              <footer className="npr-corporate-footer">
                <span>
                  <strong>NISKALA</strong> · Harmonized Hotspot Anomaly Archive · West Kalimantan
                </span>
                <span>Document {documentRef}</span>
              </footer>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td>
              <div className="npr-page-spacer" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return typeof document === 'undefined' ? null : createPortal(report, document.body);
}
