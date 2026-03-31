'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { StatCard, MiniBarChart, DonutChart, StarRating } from '@/components/ui/Charts';

export default function Statistics() {
  const { data, partner } = useApp();

  const readingStats = useMemo(() => {
    const items = data.reading ?? [];
    const finished = items.filter((b) => b.status === 'finished');
    const reading = items.filter((b) => b.status === 'reading');
    const wantToRead = items.filter((b) => b.status === 'want-to-read');
    const totalPagesRead = finished.reduce((sum, b) => sum + (b.totalPages || 0), 0)
      + reading.reduce((sum, b) => sum + (b.currentPage || 0), 0);

    return { total: items.length, finished: finished.length, reading: reading.length, wantToRead: wantToRead.length, totalPagesRead };
  }, [data.reading]);

  const watchStats = useMemo(() => {
    const items = data.watchList ?? [];
    const watched = items.filter((w) => w.status === 'watched');
    const watching = items.filter((w) => w.status === 'watching');
    const wantToWatch = items.filter((w) => w.status === 'want-to-watch');
    const movies = items.filter((w) => w.type === 'movie').length;
    const series = items.filter((w) => w.type === 'series').length;
    const docs = items.filter((w) => w.type === 'documentary').length;

    return { total: items.length, watched: watched.length, watching: watching.length, wantToWatch: wantToWatch.length, movies, series, docs };
  }, [data.watchList]);

  const ratingStats = useMemo(() => {
    const ratings = data.ratings ?? {};
    const entries = Object.values(ratings);
    if (entries.length === 0) return { count: 0, avg: 0, distribution: [] as { label: string; value: number }[] };
    const avg = entries.reduce((sum, r) => sum + r.rating, 0) / entries.length;
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      label: `${star}★`,
      value: entries.filter((r) => Math.round(r.rating) === star).length,
    }));
    return { count: entries.length, avg, distribution };
  }, [data.ratings]);

  const choreStats = useMemo(() => {
    const chores = data.chores ?? [];
    const completed = chores.filter((c) => c.completed).length;
    const total = chores.length;
    return { total, completed, pending: total - completed };
  }, [data.chores]);

  const dateStats = useMemo(() => {
    const dates = data.dates ?? [];
    const completed = dates.filter((d) => d.done).length;
    return { total: dates.length, completed, planned: dates.length - completed };
  }, [data.dates]);

  const isEmpty = readingStats.total === 0 && watchStats.total === 0 && choreStats.total === 0 && dateStats.total === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">Statistics</h1>
        <p className="text-sm text-amber-600/40">{partner ? 'a gentle look at what you\'ve shared' : 'your cozy journey so far'}</p>
      </div>

      {isEmpty ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="duck-card text-center py-12">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-sm text-amber-700/60">No data yet — start adding books, movies, dates, and chores!</p>
        </motion.div>
      ) : (
        <>
          {/* Overview cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3">
            <StatCard emoji="📚" value={readingStats.total} label="Books" />
            <StatCard emoji="🎬" value={watchStats.total} label="Watch items" />
            <StatCard emoji="📅" value={dateStats.completed} label="Dates done" />
            <StatCard emoji="✅" value={choreStats.completed} label="Chores done" />
          </motion.div>

          {/* Reading breakdown */}
          {readingStats.total > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="duck-card space-y-3">
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">📖 Reading</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-blue-700">{readingStats.wantToRead}</p>
                  <p className="text-[9px] text-blue-500">Want to read</p>
                </div>
                <div className="bg-amber-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-amber-700">{readingStats.reading}</p>
                  <p className="text-[9px] text-amber-500">Reading</p>
                </div>
                <div className="bg-green-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-green-700">{readingStats.finished}</p>
                  <p className="text-[9px] text-green-500">Finished</p>
                </div>
              </div>
              {readingStats.totalPagesRead > 0 && (
                <p className="text-xs text-amber-600/60 text-center">
                  📄 {readingStats.totalPagesRead.toLocaleString()} pages read so far
                </p>
              )}
            </motion.div>
          )}

          {/* Watch breakdown */}
          {watchStats.total > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="duck-card space-y-3">
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">🍿 Watch List</h3>
              <DonutChart
                segments={[
                  { label: 'Movies', value: watchStats.movies, color: '#f59e0b' },
                  { label: 'Series', value: watchStats.series, color: '#8b5cf6' },
                  { label: 'Docs', value: watchStats.docs, color: '#10b981' },
                ].filter((s) => s.value > 0)}
                label={`${watchStats.total} total`}
              />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-purple-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-purple-700">{watchStats.wantToWatch}</p>
                  <p className="text-[9px] text-purple-500">Queued</p>
                </div>
                <div className="bg-amber-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-amber-700">{watchStats.watching}</p>
                  <p className="text-[9px] text-amber-500">Watching</p>
                </div>
                <div className="bg-green-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-green-700">{watchStats.watched}</p>
                  <p className="text-[9px] text-green-500">Watched</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ratings */}
          {ratingStats.count > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="duck-card space-y-3">
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">⭐ Ratings</h3>
              <div className="flex items-center gap-3">
                <div className="text-center mr-2">
                  <p className="text-2xl font-bold text-amber-800">{ratingStats.avg.toFixed(1)}</p>
                  <StarRating value={ratingStats.avg} readonly size="sm" />
                  <p className="text-[9px] text-amber-500 mt-0.5">{ratingStats.count} ratings</p>
                </div>
                <div className="flex-1">
                  <MiniBarChart data={ratingStats.distribution} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Dates & Chores */}
          {(dateStats.total > 0 || choreStats.total > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="grid grid-cols-2 gap-3">
              {dateStats.total > 0 && (
                <div className="duck-card text-center">
                  <p className="text-sm mb-1">📅</p>
                  <p className="text-lg font-bold text-amber-800">{dateStats.completed}/{dateStats.total}</p>
                  <p className="text-[9px] text-amber-600/60">dates completed</p>
                  <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                      style={{ width: `${dateStats.total > 0 ? (dateStats.completed / dateStats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              )}
              {choreStats.total > 0 && (
                <div className="duck-card text-center">
                  <p className="text-sm mb-1">🧹</p>
                  <p className="text-lg font-bold text-amber-800">{choreStats.completed}/{choreStats.total}</p>
                  <p className="text-[9px] text-amber-600/60">chores done</p>
                  <div className="mt-2 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                      style={{ width: `${choreStats.total > 0 ? (choreStats.completed / choreStats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
