import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Card } from '../../components/ui/Card';
import { GitHubIcon } from '../../components/ui/GitHubIcon';
import {
  ALL_DOC_ARTICLES,
  DOC_GROUPS,
  GITHUB_REPO_URL,
  type DocBlock,
} from '../../constants/docsSections';
import { useNiskalaData } from '../../hooks/useNiskalaData';
import { formatPeakMonths } from '../../services/niskalaDataService';
import type { NiskalaDataset } from '../../types/niskala';
import { cn } from '../../utils/formatters';

/* ------------------------------------------------------------------ */
/* Math + inline text                                                  */
/* ------------------------------------------------------------------ */

function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, output: 'html' }),
    [tex, display]
  );
  return display ? (
    <div className="overflow-x-auto overflow-y-hidden py-1" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

const INLINE_PATTERN = /(\$[^$]+\$|\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function RichText({ text }: { text: string }) {
  const parts = text.split(INLINE_PATTERN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          return <TeX key={i} tex={part.slice(1, -1)} />;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="rounded bg-white/[0.06] border border-white/[0.08] px-1 py-px font-mono text-[0.9em] text-[#A4FFF0]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          return (
            <a
              key={i}
              href={link[2]}
              target="_blank"
              rel="noreferrer"
              className="text-[#A4FFF0] underline decoration-[#A4FFF0]/40 underline-offset-2 hover:decoration-[#A4FFF0]"
            >
              {link[1]}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Blocks                                                              */
/* ------------------------------------------------------------------ */

function CodeBlock({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#090b0d] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.07] bg-white/[0.02] text-[11px] font-mono text-zinc-400">
        <span>{title ?? 'Snippet'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy snippet"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-[#A4FFF0] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-[#A4FFF0]" />
              <span className="text-[#A4FFF0]">Copied</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-xs text-[#A4FFF0] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Block({
  block,
  dataset,
}: {
  block: DocBlock;
  dataset: NiskalaDataset | null;
}): ReactNode {
  switch (block.kind) {
    case 'text':
      return (
        <p className="text-[13px] sm:text-sm text-zinc-300 leading-relaxed">
          <RichText text={block.text} />
        </p>
      );

    case 'math':
      return (
        <figure className="rounded-xl border border-[#A4FFF0]/15 bg-[#A4FFF0]/[0.03] px-4 py-3 text-white [&_.katex]:text-[1.05em]">
          <TeX tex={block.tex} display />
          {block.caption && (
            <figcaption className="mt-1 text-[11px] text-zinc-400 text-center">
              <RichText text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className="flex flex-col gap-2 text-[13px] sm:text-sm text-zinc-300 leading-relaxed">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 mt-[0.2em] font-brand text-[11px] text-[#A4FFF0] w-4 text-right">
                {block.ordered ? `${i + 1}.` : '—'}
              </span>
              <span className="min-w-0">
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ListTag>
      );
    }

    case 'table':
      return (
        <figure className="flex flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-white/[0.1]">
            <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
              <thead className="bg-white/[0.03]">
                <tr>
                  {block.columns.map((col, i) => (
                    <th
                      key={col}
                      className={cn(
                        'px-3.5 py-2.5 font-brand text-[10px] uppercase tracking-[0.12em] font-normal text-zinc-400 border-b border-white/[0.1] whitespace-nowrap',
                        block.align?.[i] === 'right' && 'text-right'
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.02]">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={cn(
                          'px-3.5 py-2 align-top',
                          c === 0 ? 'text-white' : 'text-zinc-300',
                          block.align?.[c] === 'right' && 'text-right tabular-nums'
                        )}
                      >
                        <RichText text={String(cell)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="text-[11px] text-zinc-400 leading-relaxed">
              <RichText text={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case 'figure':
      return (
        <figure className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/[0.1] bg-white p-2 overflow-hidden">
            <img src={block.src} alt={block.alt} loading="lazy" className="w-full h-auto rounded-md" />
          </div>
          <figcaption className="text-[11px] text-zinc-400 leading-relaxed">
            <RichText text={block.caption} />
          </figcaption>
        </figure>
      );

    case 'code':
      return <CodeBlock title={block.title} code={block.code} />;

    case 'callout': {
      const warn = block.tone === 'warn';
      const Icon = warn ? ExclamationTriangleIcon : InformationCircleIcon;
      return (
        <div
          className={cn(
            'flex gap-3 rounded-xl border px-4 py-3',
            warn ? 'border-[#FF9C33]/30 bg-[#FF9C33]/[0.06]' : 'border-[#A4FFF0]/25 bg-[#A4FFF0]/[0.05]'
          )}
        >
          <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', warn ? 'text-[#FF9C33]' : 'text-[#A4FFF0]')} />
          <div className="flex flex-col gap-1 min-w-0">
            {block.title && <p className="text-[13px] font-semibold text-white">{block.title}</p>}
            <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
              <RichText text={block.text} />
            </p>
          </div>
        </div>
      );
    }

    case 'links':
      return (
        <ul className="flex flex-col gap-2">
          {block.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45"
              >
                <span className="flex flex-col min-w-0">
                  <span className="text-[13px] text-white">{item.label}</span>
                  <span className="text-[11px] text-zinc-400 truncate">
                    {item.note ? `${item.note} · ` : ''}
                    {item.href.replace(/^https?:\/\//, '')}
                  </span>
                </span>
                <ArrowUpRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#A4FFF0] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </li>
          ))}
        </ul>
      );

    case 'calibrationTable':
      if (!dataset) {
        return (
          <div className="h-48 rounded-xl border border-white/[0.08] bg-white/[0.02]" />
        );
      }
      return (
        <div className="overflow-x-auto rounded-xl border border-white/[0.1]">
          <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] font-brand text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                <th className="py-3 px-4 font-normal">Region</th>
                <th className="py-3 px-4 font-normal">Shrunk Ratio</th>
                <th className="py-3 px-4 font-normal">Raw Ratio</th>
                <th className="py-3 px-4 font-normal">Normal Peak</th>
                <th className="py-3 px-4 font-normal">SiPongi Spearman</th>
                <th className="py-3 px-4 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {dataset.meta.districts.map((dist) => {
                const spearman =
                  dist.slug === 'kalimantan-barat'
                    ? dataset.meta.sipongi.spearman_province_2016_2025
                    : dataset.meta.sipongi.per_district_spearman[dist.name];
                return (
                  <tr
                    key={dist.slug}
                    className="group transition-colors duration-200 hover:bg-white/[0.03]"
                  >
                    <td className="py-2.5 px-4 font-medium text-white">{dist.name}</td>
                    <td className="py-2.5 px-4 font-medium text-[#A4FFF0] tabular-nums">
                      {dist.ratio.toFixed(3)}×
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400 tabular-nums">
                      {dist.raw_ratio.toFixed(3)}×
                    </td>
                    <td className="py-2.5 px-4 text-zinc-300">
                      {formatPeakMonths(dist.peak_months)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-200 tabular-nums">
                      {spearman !== undefined ? spearman.toFixed(2) : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <Link
                        to={`/calendar?region=${dist.slug}&focus=2026-10`}
                        className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 text-[10px] font-brand uppercase tracking-[0.1em] text-zinc-300 hover:text-white"
                      >
                        <span>Inspect</span>
                        <ArrowUpRightIcon className="w-3 h-3 text-[#A4FFF0] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DocsPage() {
  const { dataset } = useNiskalaData();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDocId = searchParams.get('doc');

  const activeIndex = useMemo(() => {
    if (!requestedDocId) return 0;
    const idx = ALL_DOC_ARTICLES.findIndex((item) => item.id === requestedDocId);
    return idx >= 0 ? idx : 0;
  }, [requestedDocId]);

  const activeDoc = ALL_DOC_ARTICLES[activeIndex];
  const prevDoc = activeIndex > 0 ? ALL_DOC_ARTICLES[activeIndex - 1] : null;
  const nextDoc =
    activeIndex < ALL_DOC_ARTICLES.length - 1 ? ALL_DOC_ARTICLES[activeIndex + 1] : null;

  const harm = dataset?.meta.harmonization;
  const [scrolledSection, setScrolledSection] = useState<{
    docId: string;
    sectionId: string;
  } | null>(null);

  const activeSectionId =
    scrolledSection?.docId === activeDoc.id
      ? scrolledSection.sectionId
      : (activeDoc.sections[0]?.id ?? '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeDoc.id]);

  useEffect(() => {
    if (activeDoc.sections.length <= 1) return undefined;

    const handleScroll = () => {
      const threshold = window.innerWidth >= 768 ? 140 : 175;
      let currentId = activeDoc.sections[0]?.id ?? '';
      for (const sec of activeDoc.sections) {
        const el = document.getElementById(`doc-${activeDoc.id}-${sec.id}`);
        if (el && el.getBoundingClientRect().top <= threshold) {
          currentId = sec.id;
        }
      }
      setScrolledSection({ docId: activeDoc.id, sectionId: currentId });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeDoc]);

  const openDoc = (id: string) => {
    setSearchParams(id === ALL_DOC_ARTICLES[0].id ? {} : { doc: id });
  };

  const scrollToSection = (id: string) => {
    setScrolledSection({ docId: activeDoc.id, sectionId: id });
    const el = document.getElementById(`doc-${activeDoc.id}-${id}`);
    if (!el) return;
    const offset = window.innerWidth >= 768 ? 118 : 154;
    const targetTop = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
      {/* Left Sidebar Navigation (Sticky & Independently Scrollable on Desktop) */}
      <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:overscroll-contain lg:border-r lg:border-white/[0.08] lg:pr-4">
        <div className="flex flex-col gap-6 pb-8">
          {/* GitHub Repository CTA */}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 group"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <GitHubIcon className="w-4 h-4 text-zinc-200 group-hover:text-[#A4FFF0] shrink-0 transition-colors" />
              <span className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-white truncate">GitHub Repository</span>
                <span className="text-[11px] text-zinc-400 truncate">
                  sulthonaw/niskala
                </span>
              </span>
            </span>
            <ArrowUpRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#A4FFF0] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* Grouped Sidebar Tabs */}
          <nav aria-label="Documentation sections" className="shrink-0 flex flex-col gap-5">
            {DOC_GROUPS.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                <div className="font-brand text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                  {group.title}
                </div>
                <div className="flex flex-col border-l border-white/[0.1]">
                  {group.items.map((item) => {
                    const isActive = item.id === activeDoc.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openDoc(item.id)}
                        className={cn(
                          '-ml-px pl-3.5 py-1.5 text-left text-[13px] border-l-2 transition-all duration-200 cursor-pointer',
                          isActive
                            ? 'border-[#A4FFF0] text-white font-medium pl-4 bg-[#A4FFF0]/[0.05]'
                            : 'border-transparent text-zinc-400 hover:text-zinc-100 hover:border-white/35 hover:pl-4'
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Right Content Pane (Uses Main Viewport Scrollbar on Screen Edge) */}
      <div className="flex-1 min-w-0 w-full">
        <article key={activeDoc.id} className="flex flex-col gap-6 pb-16 sm:pb-24">
        {/* Category Eyebrow & Header */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-brand text-[11px] uppercase tracking-[0.18em] text-[#A4FFF0]">
              {activeDoc.group}
            </span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 text-[10px] font-brand uppercase tracking-[0.1em] text-zinc-300 hover:text-white"
            >
              <GitHubIcon className="w-3.5 h-3.5" />
              <span>Source on GitHub</span>
              <ArrowUpRightIcon className="w-3 h-3 text-[#A4FFF0] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
            {activeDoc.title}
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
            <RichText text={activeDoc.summary} />
          </p>
        </header>

        {/* Sticky On-This-Page Section Tabs */}
        {activeDoc.sections.length > 1 && (
          <div className="sticky top-[93px] md:top-[57px] z-30 -mx-1 px-1 py-2.5 bg-[#050507]/90 backdrop-blur-md flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.1]">
            {activeDoc.sections.map((section) => {
              const isSectionActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'relative pb-1 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer',
                    isSectionActive
                      ? 'text-[#A4FFF0]'
                      : 'hover-slide-underline text-zinc-400 hover:text-zinc-100'
                  )}
                >
                  <span>{section.heading}</span>
                  {isSectionActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#A4FFF0] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Article sections */}
        <Card key={`card-${activeDoc.id}`}>
          <div className="flex flex-col gap-8">
            {activeDoc.sections.map((section, index) => (
              <section
                key={`${activeDoc.id}-${section.id}`}
                id={`doc-${activeDoc.id}-${section.id}`}
                className="scroll-mt-40 md:scroll-mt-32 flex flex-col gap-4 pt-6 border-t border-white/[0.07] first:border-t-0 first:pt-2"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg border border-white/[0.14] bg-white/[0.04] flex items-center justify-center font-brand text-[11px] text-[#A4FFF0]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                    {section.heading}
                  </h2>
                </div>
                <div className="flex flex-col gap-4 sm:pl-10">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} dataset={dataset} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Card>

        {/* Live parameters + source files */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Live Dataset Parameters">
            <div className="flex flex-col gap-2 text-xs text-zinc-300 leading-relaxed">
              <p>
                <strong className="text-white">Reference Sensor:</strong>{' '}
                {harm?.reference ?? 'VIIRS NOAA-20 (375 m)'}
              </p>
              <p>
                <strong className="text-white">MODIS Anchor:</strong>{' '}
                {harm?.modis_reference ?? 'MODIS Aqua (1 km)'}
              </p>
              <p>
                <strong className="text-white">Baseline Window:</strong>{' '}
                {dataset
                  ? `${dataset.meta.baseline_years[0]}–${dataset.meta.baseline_years[1]} LOYO`
                  : '2003–2025 LOYO'}
              </p>
              <p>
                <strong className="text-white">Last Generated:</strong>{' '}
                {dataset?.meta.generated_local ?? '—'}
              </p>
            </div>
          </Card>

          <Card title="Source Files">
            <div className="flex flex-col gap-2 text-xs text-zinc-400 leading-relaxed h-full">
              <p>The code and data this page describes.</p>
              <ul className="flex flex-col gap-1.5">
                {(activeDoc.sources ?? ['data-harmonization/README.md']).map((src) => (
                  <li
                    key={src}
                    className="rounded-lg bg-black/50 border border-white/[0.08] px-3 py-1.5 font-mono text-[11px] text-zinc-300 break-all"
                  >
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Previous / Next Article Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08] text-xs">
          {prevDoc ? (
            <button
              type="button"
              onClick={() => openDoc(prevDoc.id)}
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 text-zinc-300 hover:text-white cursor-pointer"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5 text-[#A4FFF0] transition-transform duration-200 group-hover:-translate-x-0.5" />
              <span>{prevDoc.label}</span>
            </button>
          ) : (
            <span />
          )}

          {nextDoc && (
            <button
              type="button"
              onClick={() => openDoc(nextDoc.id)}
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 text-zinc-300 hover:text-white cursor-pointer"
            >
              <span>{nextDoc.label}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-[#A4FFF0] transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </article>
      </div>
    </div>
  );
}
