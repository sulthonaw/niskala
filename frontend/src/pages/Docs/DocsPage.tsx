import { Fragment, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
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

function Block({ block }: { block: DocBlock }): ReactNode {
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
              <span className="shrink-0 mt-[0.2em] font-mono text-[11px] text-[#A4FFF0] w-4 text-right">
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
                        'px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] font-normal text-zinc-400 border-b border-white/[0.1] whitespace-nowrap',
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
                          block.align?.[c] === 'right' && 'text-right font-mono tabular-nums'
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
                  <span className="text-[11px] font-mono text-zinc-400 truncate">
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
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DocsPage() {
  const { dataset } = useNiskalaData();
  const [activeDocId, setActiveDocId] = useState(ALL_DOC_ARTICLES[0].id);

  const activeIndex = Math.max(
    ALL_DOC_ARTICLES.findIndex((item) => item.id === activeDocId),
    0
  );
  const activeDoc = ALL_DOC_ARTICLES[activeIndex];
  const prevDoc = activeIndex > 0 ? ALL_DOC_ARTICLES[activeIndex - 1] : null;
  const nextDoc =
    activeIndex < ALL_DOC_ARTICLES.length - 1 ? ALL_DOC_ARTICLES[activeIndex + 1] : null;

  const harm = dataset?.meta.harmonization;

  const openDoc = (id: string) => {
    setActiveDocId(id);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(`doc-${activeDoc.id}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Left Sidebar Navigation (Tailwind Docs Style) */}
      <aside className="w-full lg:w-64 lg:shrink-0 lg:sticky lg:top-24 lg:self-start flex flex-col gap-6 lg:border-r lg:border-white/[0.08] lg:pr-6">
        {/* GitHub Repository CTA */}
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 group"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <GitHubIcon className="w-4 h-4 text-zinc-200 group-hover:text-[#A4FFF0] shrink-0 transition-colors" />
            <span className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">GitHub Repository</span>
              <span className="text-[11px] font-mono text-zinc-400 truncate">
                sulthonaw/niskala
              </span>
            </span>
          </span>
          <ArrowUpRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#A4FFF0] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Grouped Sidebar Tabs */}
        <nav aria-label="Documentation sections" className="flex flex-col gap-5">
          {DOC_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
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
      </aside>

      {/* Right Content Pane */}
      <article className="flex-1 min-w-0 w-full flex flex-col gap-6">
        {/* Category Eyebrow & Header */}
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A4FFF0]">
              {activeDoc.group}
            </span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="group hover-slide-fill [--slide-bg:rgba(164,255,240,0.09)] inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-white/[0.12] bg-white/[0.025] hover:border-[#A4FFF0]/45 text-xs font-mono text-zinc-300 hover:text-white"
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

        {/* On this page (section jump links) */}
        {activeDoc.sections.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.1] pb-2.5">
            {activeDoc.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="hover-slide-underline text-xs sm:text-[13px] font-medium text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                {section.heading}
              </button>
            ))}
          </div>
        )}

        {/* Article sections */}
        <Card>
          <div className="flex flex-col gap-8">
            {activeDoc.sections.map((section, index) => (
              <section
                key={`${activeDoc.id}-${section.id}`}
                id={`doc-${activeDoc.id}-${section.id}`}
                className="scroll-mt-28 flex flex-col gap-4 pt-6 border-t border-white/[0.07] first:border-t-0 first:pt-2"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg border border-white/[0.14] bg-white/[0.04] flex items-center justify-center font-mono text-[11px] text-[#A4FFF0]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white">
                    {section.heading}
                  </h2>
                </div>
                <div className="flex flex-col gap-4 sm:pl-10">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
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
  );
}
