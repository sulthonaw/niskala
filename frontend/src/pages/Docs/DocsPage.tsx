import { useState } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { GitHubIcon } from '../../components/ui/GitHubIcon';
import {
  ALL_DOC_ARTICLES,
  DOC_GROUPS,
  GITHUB_REPO_URL,
  type DocStep,
} from '../../constants/docsSections';
import { useNiskalaData } from '../../hooks/useNiskalaData';
import { cn } from '../../utils/formatters';

function StepBlock({ step }: { step: DocStep }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!step.code || typeof navigator === 'undefined' || !navigator.clipboard) return;
    void navigator.clipboard.writeText(step.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start pt-5 border-t border-white/[0.07] first:border-t-0 first:pt-0">
      <div className="xl:col-span-5 flex items-start gap-3">
        <span className="shrink-0 w-7 h-7 rounded-lg border border-white/[0.14] bg-white/[0.04] flex items-center justify-center font-mono text-[11px] text-[#A4FFF0]">
          {step.step}
        </span>
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{step.heading}</h3>
          <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>

      {step.code && (
        <div className="xl:col-span-7 rounded-xl border border-white/[0.1] bg-[#090b0d] overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.07] bg-white/[0.02] text-[11px] font-mono text-zinc-400">
            <span>{step.codeTitle ?? 'Snippet'}</span>
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
            <code>{step.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export function DocsPage() {
  const { dataset } = useNiskalaData();
  const [activeDocId, setActiveDocId] = useState(ALL_DOC_ARTICLES[0].id);
  const [activeSubTabMap, setActiveSubTabMap] = useState<Record<string, string>>({});

  const activeIndex = Math.max(
    ALL_DOC_ARTICLES.findIndex((item) => item.id === activeDocId),
    0
  );
  const activeDoc = ALL_DOC_ARTICLES[activeIndex];
  const prevDoc = activeIndex > 0 ? ALL_DOC_ARTICLES[activeIndex - 1] : null;
  const nextDoc =
    activeIndex < ALL_DOC_ARTICLES.length - 1 ? ALL_DOC_ARTICLES[activeIndex + 1] : null;

  const subTabs = activeDoc.subTabs ?? [];
  const selectedSubTabId = activeSubTabMap[activeDoc.id] ?? subTabs[0]?.id;
  const activeSubTab = subTabs.find((t) => t.id === selectedSubTabId) ?? subTabs[0] ?? null;

  const visibleSteps = activeSubTab ? activeSubTab.steps : (activeDoc.steps ?? []);
  const harm = dataset?.meta.harmonization;

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
                      onClick={() => setActiveDocId(item.id)}
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
            {activeDoc.summary}
          </p>
        </header>

        {/* Horizontal Sub-Tabs (Tailwind "Using Vite | Using PostCSS" style) */}
        {subTabs.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-5 border-b border-white/[0.1]">
              {subTabs.map((tab) => {
                const isActive = activeSubTab?.id === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveSubTabMap((prev) => ({
                        ...prev,
                        [activeDoc.id]: tab.id,
                      }))
                    }
                    className={cn(
                      'relative -mb-px pb-2.5 text-xs sm:text-[13px] font-medium border-b-2 transition-colors cursor-pointer',
                      isActive
                        ? 'border-[#A4FFF0] text-[#A4FFF0]'
                        : 'hover-slide-underline border-transparent text-zinc-400 hover:text-zinc-100'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {activeSubTab && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {activeSubTab.intro}
              </p>
            )}
          </div>
        )}

        {/* Numbered Tutorial / Template Steps */}
        <Card title="Specification & Walkthrough">
          <div className="flex flex-col gap-5">
            {visibleSteps.map((step) => (
              <StepBlock key={`${activeDoc.id}-${step.step}`} step={step} />
            ))}
          </div>
        </Card>

        {/* Live Telemetry Reference Card + Template Note */}
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

          <Card title="Template Content Slot">
            <div className="flex flex-col justify-between gap-3 text-xs text-zinc-400 leading-relaxed h-full">
              <p>
                {activeDoc.templateNote ??
                  'Edit src/constants/docsSections.ts to add custom sections, equations, notebooks, or team documentation.'}
              </p>
              <code className="rounded-lg bg-black/50 border border-white/[0.08] px-3 py-2 font-mono text-[11px] text-zinc-300">
                src/constants/docsSections.ts · id: &quot;{activeDoc.id}&quot;
              </code>
            </div>
          </Card>
        </div>

        {/* Previous / Next Article Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08] text-xs">
          {prevDoc ? (
            <button
              type="button"
              onClick={() => setActiveDocId(prevDoc.id)}
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
              onClick={() => setActiveDocId(nextDoc.id)}
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
