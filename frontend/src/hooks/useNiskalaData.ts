import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  loadNiskalaDataset,
  parseYearMonth,
  rankDistrictsForMonth,
} from '../services/niskalaDataService';
import type {
  AnnualRow,
  DistrictMeta,
  DistrictRankItem,
  MonthCell,
  NiskalaDataset,
  SipongiRow,
} from '../types/niskala';

const DEFAULT_REGION = 'kalimantan-barat';
const DEFAULT_FOCUS_MONTH = '2026-10';
const DEFAULT_FROM = '2002-07';
const DEFAULT_TO = '2026-11';

export function useNiskalaData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataset, setDataset] = useState<NiskalaDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const regionSlug = searchParams.get('region') ?? DEFAULT_REGION;
  const focusMonth = searchParams.get('focus') ?? DEFAULT_FOCUS_MONTH;
  const fromYm = searchParams.get('from') ?? DEFAULT_FROM;
  const toYm = searchParams.get('to') ?? DEFAULT_TO;

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    loadNiskalaDataset()
      .then((loaded) => {
        if (!active) return;
        setDataset(loaded);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load dataset');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const setRegion = useCallback(
    (nextRegion: string) => {
      const next = new URLSearchParams(searchParams);
      next.set('region', nextRegion);
      if (!next.get('focus')) next.set('focus', focusMonth);
      setSearchParams(next, { replace: true });
    },
    [focusMonth, searchParams, setSearchParams]
  );

  const setFocusMonth = useCallback(
    (nextFocus: string) => {
      const next = new URLSearchParams(searchParams);
      if (!next.get('region')) next.set('region', regionSlug);
      next.set('focus', nextFocus);
      setSearchParams(next, { replace: true });
    },
    [regionSlug, searchParams, setSearchParams]
  );

  const setScenario = useCallback(
    (nextRegion: string, nextFocus: string) => {
      const next = new URLSearchParams(searchParams);
      next.set('region', nextRegion);
      next.set('focus', nextFocus);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setRange = useCallback(
    (nextFrom: string, nextTo: string) => {
      const next = new URLSearchParams(searchParams);
      if (!next.get('region')) next.set('region', regionSlug);
      if (!next.get('focus')) next.set('focus', focusMonth);
      next.set('from', nextFrom);
      next.set('to', nextTo);
      setSearchParams(next, { replace: true });
    },
    [focusMonth, regionSlug, searchParams, setSearchParams]
  );

  const activeDistrict = useMemo<DistrictMeta | null>(() => {
    if (!dataset) return null;
    return (
      dataset.meta.districts.find((d) => d.slug === regionSlug) ??
      dataset.meta.districts[0] ??
      null
    );
  }, [dataset, regionSlug]);

  const regionCells = useMemo<MonthCell[]>(() => {
    if (!dataset || !activeDistrict) return [];
    const cells = dataset.calendarBySlug[activeDistrict.slug] ?? [];
    return cells.filter((c) => c.ym >= fromYm && c.ym <= toYm);
  }, [dataset, activeDistrict, fromYm, toYm]);

  const focusCell = useMemo<MonthCell | null>(() => {
    if (!dataset || !activeDistrict) return null;
    const allCells = dataset.calendarBySlug[activeDistrict.slug] ?? [];
    return allCells.find((c) => c.ym === focusMonth) ?? null;
  }, [dataset, activeDistrict, focusMonth]);

  // Same calendar month across years for the "How bad" comparison bars
  const sameMonthHistory = useMemo<MonthCell[]>(() => {
    if (!dataset || !activeDistrict) return [];
    const { month } = parseYearMonth(focusMonth);
    const allCells = dataset.calendarBySlug[activeDistrict.slug] ?? [];
    return allCells
      .filter((c) => c.month === month && c.year >= 2012 && c.hotspots !== null)
      .slice(-15);
  }, [dataset, activeDistrict, focusMonth]);

  const districtRanking = useMemo<DistrictRankItem[]>(() => {
    if (!dataset) return [];
    return rankDistrictsForMonth(dataset.calendarBySlug, dataset.meta.districts, focusMonth);
  }, [dataset, focusMonth]);

  const activeDistrictRank = useMemo<DistrictRankItem | null>(() => {
    if (!activeDistrict || activeDistrict.slug === 'kalimantan-barat') return null;
    return districtRanking.find((item) => item.district.slug === activeDistrict.slug) ?? null;
  }, [activeDistrict, districtRanking]);

  const sipongiSeries = useMemo<SipongiRow[]>(() => {
    if (!dataset || !activeDistrict) return [];
    return dataset.sipongi[activeDistrict.slug] ?? [];
  }, [dataset, activeDistrict]);

  const annualSeries = useMemo<AnnualRow[]>(() => {
    if (!dataset || !activeDistrict) return [];
    return (dataset.annual[activeDistrict.slug] ?? []).filter(
      (row) => row.year >= 2003 && row.year <= 2025
    );
  }, [dataset, activeDistrict]);

  return {
    dataset,
    loading,
    error,
    reload,
    regionSlug: activeDistrict?.slug ?? DEFAULT_REGION,
    focusMonth,
    fromYm,
    toYm,
    activeDistrict,
    regionCells,
    focusCell,
    sameMonthHistory,
    districtRanking,
    activeDistrictRank,
    sipongiSeries,
    annualSeries,
    setRegion,
    setFocusMonth,
    setScenario,
    setRange,
  };
}
