'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

/* ---- Star Rating (half-star support) ---- */
export function StarRating({
  value = 0,
  onChange,
  size = 'md',
  readonly = false,
  label,
}: {
  value?: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md';
  readonly?: boolean;
  label?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[10px] text-amber-600/60 font-medium mr-1">{label}</span>}
      <div className="flex items-center gap-0.5" onMouseLeave={() => !readonly && setHover(null)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = display >= star;
          const isHalf = !isFull && display >= star - 0.5;
          return (
            <div
              key={star}
              className={cn('relative', !readonly && 'cursor-pointer')}
              onMouseMove={(e) => {
                if (readonly) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const half = e.clientX < rect.left + rect.width / 2;
                setHover(half ? star - 0.5 : star);
              }}
              onClick={() => {
                if (readonly || !onChange) return;
                const val = hover ?? star;
                onChange(val === value ? 0 : val);
              }}
            >
              {/* Background (empty star) */}
              <Star className={cn(starSize, 'text-amber-200')} />
              {/* Filled overlay */}
              {(isFull || isHalf) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isFull ? '100%' : '50%' }}
                >
                  <Star className={cn(starSize, 'text-amber-400 fill-amber-400')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {value > 0 && (
        <span className="text-[10px] text-amber-500 font-medium ml-0.5">{value}</span>
      )}
    </div>
  );
}

/* ---- Reading Progress Bar ---- */
export function ReadingProgressBar({
  currentPage = 0,
  totalPages = 0,
  compact = false,
}: {
  currentPage?: number;
  totalPages?: number;
  compact?: boolean;
}) {
  if (!totalPages || totalPages <= 0) return null;
  const pct = Math.min(100, Math.round((currentPage / totalPages) * 100));

  return (
    <div className={cn('w-full', compact ? 'mt-1' : 'mt-2')}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-amber-600/60">
          {currentPage} / {totalPages} pages
        </span>
        <span className="text-[10px] font-semibold text-amber-700">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ---- Mini Bar Chart (for statistics) ---- */
export function MiniBarChart({
  data,
  maxHeight = 60,
}: {
  data: { label: string; value: number; color?: string }[];
  maxHeight?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 justify-center" style={{ height: maxHeight + 24 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 20 }}>
          <span className="text-[9px] text-amber-600 font-medium">{d.value || ''}</span>
          <div
            className={cn('w-5 rounded-t-sm transition-all', d.color || 'bg-amber-300')}
            style={{ height: Math.max(2, (d.value / max) * maxHeight) }}
          />
          <span className="text-[8px] text-amber-500/60">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- Donut Chart ---- */
export function DonutChart({
  segments,
  size = 80,
  strokeWidth = 10,
  label,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      {label && <span className="text-[10px] text-amber-600 font-medium">{label}</span>}
      <div className="flex flex-wrap gap-2 justify-center">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[9px] text-amber-600/70">{seg.label} ({seg.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Stat Card ---- */
export function StatCard({ label, value, emoji }: { label: string; value: string | number; emoji: string }) {
  return (
    <div className="duck-card text-center py-3 flex-1 min-w-0">
      <div className="text-lg mb-0.5">{emoji}</div>
      <div className="text-lg font-bold text-amber-800">{value}</div>
      <div className="text-[10px] text-amber-600/60">{label}</div>
    </div>
  );
}
