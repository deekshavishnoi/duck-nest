'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReadingItem, WatchItem, ItemRating } from '@/types';
import { MiniBarChart, StarRating, DualBarChart } from '@/components/ui/Charts';
import { useApp } from '@/hooks/useAppData';

/* ---- Reading Stats Panel ---- */
export function ReadingStatsPanel({ items, ratings }: {
  items: ReadingItem[];
  ratings: Record<string, ItemRating>;
}) {
  const stats = useMemo(() => {
    const finished = items.filter((b) => b.status === 'finished');
    const reading = items.filter((b) => b.status === 'reading');
    const totalPagesRead = finished.reduce((sum, b) => sum + (b.totalPages || 0), 0)
      + reading.reduce((sum, b) => sum + (b.currentPage || 0), 0);

    // Reading ratings
    const bookRatings = Object.entries(ratings)
      .filter(([key]) => items.some((b) => key.startsWith(b.id + ':')))
      .map(([, r]) => r);
    const avgRating = bookRatings.length > 0
      ? bookRatings.reduce((sum, r) => sum + r.rating, 0) / bookRatings.length : 0;

    // Pages per day (rough estimate from finished books)
    let pagesPerDay = 0;
    const booksWithDates = finished.filter((b) => b.startedAt && b.finishedAt && b.totalPages);
    if (booksWithDates.length > 0) {
      const totalDays = booksWithDates.reduce((sum, b) => {
        const start = new Date(b.startedAt!).getTime();
        const end = new Date(b.finishedAt!).getTime();
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        return sum + days;
      }, 0);
      const totalPgs = booksWithDates.reduce((sum, b) => sum + (b.totalPages || 0), 0);
      pagesPerDay = Math.round(totalPgs / totalDays);
    }

    return { total: items.length, finished: finished.length, reading: reading.length, totalPagesRead, avgRating, ratingCount: bookRatings.length, pagesPerDay };
  }, [items, ratings]);

  if (stats.total === 0) return (
    <div className="text-center py-4 space-y-1.5">
      <p className="text-2xl">📚</p>
      <p className="text-xs font-medium text-slate-500">Your reading journey will appear here</p>
      <p className="text-[10px] text-slate-400">Add a book or start reading to see your stats.</p>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-blue-700">{stats.finished}</p>
          <p className="text-[9px] text-slate-500">Finished</p>
        </div>
        <div className="bg-sky-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-sky-700">{stats.reading}</p>
          <p className="text-[9px] text-slate-500">Reading</p>
        </div>
        <div className="bg-indigo-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-indigo-700">{stats.total}</p>
          <p className="text-[9px] text-slate-500">Total</p>
        </div>
      </div>
      {stats.totalPagesRead > 0 && (
        <p className="text-xs text-slate-500 text-center">
          📄 {stats.totalPagesRead.toLocaleString()} pages read
          {stats.pagesPerDay > 0 && ` · ~${stats.pagesPerDay} pages/day`}
        </p>
      )}
      {stats.ratingCount > 0 && (
        <div className="flex items-center justify-center gap-2">
          <StarRating value={stats.avgRating} readonly size="sm" />
          <span className="text-[10px] text-slate-400">avg ({stats.ratingCount})</span>
        </div>
      )}
    </div>
  );
}

/* ---- Watch Stats Panel ---- */
export function WatchStatsPanel({ items, ratings }: {
  items: WatchItem[];
  ratings: Record<string, ItemRating>;
}) {
  const { currentUser, partner, myDisplayName, partnerDisplayName } = useApp();

  const stats = useMemo(() => {
    const watched = items.filter((w) => w.status === 'watched');
    const movies = watched.filter((w) => w.type === 'movie').length;
    const series = watched.filter((w) => w.type === 'series').length;
    const docs = watched.filter((w) => w.type === 'documentary').length;

    // Time-based stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const watchedLastWeek = watched.filter((w) => w.watchedAt && new Date(w.watchedAt) >= oneWeekAgo).length;
    const watchedLastMonth = watched.filter((w) => w.watchedAt && new Date(w.watchedAt) >= oneMonthAgo).length;

    // Per-user ratings
    const myId = currentUser?.id;
    const partnerId = partner?.id;

    const myRatings: ItemRating[] = [];
    const partnerRatings: ItemRating[] = [];
    Object.entries(ratings).forEach(([key, r]) => {
      const matchesItem = items.some((w) => key.startsWith(w.id + ':'));
      if (!matchesItem) return;
      if (myId && key.endsWith(':' + myId)) myRatings.push(r);
      if (partnerId && key.endsWith(':' + partnerId)) partnerRatings.push(r);
    });

    const allRatings = [...myRatings, ...partnerRatings];
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length : 0;

    // Half-star buckets: 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5
    const buckets = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    const toBucket = (rating: number) => {
      const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5
      return Math.max(0.5, Math.min(5, rounded));
    };

    const myDistribution = buckets.map((b) => ({
      label: b % 1 === 0 ? `${b}` : `${b}`,
      value: myRatings.filter((r) => toBucket(r.rating) === b).length,
    }));
    const partnerDistribution = buckets.map((b) => ({
      label: b % 1 === 0 ? `${b}` : `${b}`,
      value: partnerRatings.filter((r) => toBucket(r.rating) === b).length,
    }));

    const myAvg = myRatings.length > 0
      ? myRatings.reduce((sum, r) => sum + r.rating, 0) / myRatings.length : 0;
    const partnerAvg = partnerRatings.length > 0
      ? partnerRatings.reduce((sum, r) => sum + r.rating, 0) / partnerRatings.length : 0;

    return {
      total: items.length, watched: watched.length, movies, series, docs,
      watchedLastWeek, watchedLastMonth, avgRating,
      ratingCount: allRatings.length, myRatingCount: myRatings.length, partnerRatingCount: partnerRatings.length,
      myDistribution, partnerDistribution, myAvg, partnerAvg,
    };
  }, [items, ratings, currentUser, partner]);

  if (stats.total === 0) return (
    <div className="text-center py-4 space-y-1.5">
      <p className="text-2xl">🎬</p>
      <p className="text-xs font-medium text-slate-500">Your movie &amp; series activity will show up here</p>
      <p className="text-[10px] text-slate-400">Watch something first to unlock your stats.</p>
    </div>
  );

  const hasPartner = !!partner;
  const hasDualRatings = stats.myRatingCount > 0 && stats.partnerRatingCount > 0;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-emerald-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-emerald-700">{stats.watched}</p>
          <p className="text-[9px] text-slate-500">Watched</p>
        </div>
        <div className="bg-blue-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-blue-700">{stats.total}</p>
          <p className="text-[9px] text-slate-500">Total</p>
        </div>
        <div className="bg-violet-50 rounded-xl py-2 px-1">
          <p className="text-lg font-bold text-violet-700">
            {stats.movies}/{stats.series}/{stats.docs}
          </p>
          <p className="text-[9px] text-slate-500">🎬/📺/🎞️</p>
        </div>
      </div>
      {(stats.watchedLastWeek > 0 || stats.watchedLastMonth > 0) && (
        <p className="text-xs text-slate-500 text-center">
          {stats.watchedLastWeek > 0 && `${stats.watchedLastWeek} this week`}
          {stats.watchedLastWeek > 0 && stats.watchedLastMonth > 0 && ' · '}
          {stats.watchedLastMonth > 0 && `${stats.watchedLastMonth} this month`}
        </p>
      )}
      {stats.ratingCount > 0 && (
        <div className="space-y-2">
          {/* Per-user averages */}
          {hasPartner ? (
            <div className="flex items-center justify-center gap-6">
              {stats.myRatingCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating value={stats.myAvg} readonly size="sm" />
                  <span className="text-[10px] text-slate-400">{myDisplayName} ({stats.myRatingCount})</span>
                </div>
              )}
              {stats.partnerRatingCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating value={stats.partnerAvg} readonly size="sm" />
                  <span className="text-[10px] text-slate-400">{partnerDisplayName} ({stats.partnerRatingCount})</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <StarRating value={stats.avgRating} readonly size="sm" />
              <span className="text-[10px] text-slate-400">avg ({stats.ratingCount})</span>
            </div>
          )}
          {/* Rating distribution chart */}
          {hasDualRatings ? (
            <DualBarChart
              data1={stats.myDistribution}
              data2={stats.partnerDistribution}
              label1={myDisplayName || 'You'}
              label2={partnerDisplayName || 'Partner'}
            />
          ) : stats.myDistribution.some((d) => d.value > 0) ? (
            <MiniBarChart data={stats.myDistribution} />
          ) : stats.partnerDistribution.some((d) => d.value > 0) ? (
            <MiniBarChart data={stats.partnerDistribution} />
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ---- Stats Toggle Button ---- */
export function StatsToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="text-[10px] px-2.5 py-1 rounded-full font-medium transition-all bg-blue-50 text-blue-600 hover:bg-blue-100"
    >
      {open ? 'Hide stats' : '📊 Stats'}
    </button>
  );
}

/* ---- Stats Wrapper with animation ---- */
export function StatsDropdown({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="duck-card space-y-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
