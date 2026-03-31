'use client';

import { cn } from '@/lib/utils';

/* ---- Hand-drawn style duck doodle SVGs ---- */

interface DoodleProps {
  className?: string;
  size?: number;
}

/* Cute sitting duck — chibi style */
export function DuckSitting({ className, size = 40 }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn('text-amber-400', className)} fill="none">
      {/* Body */}
      <ellipse cx="32" cy="40" rx="18" ry="14" fill="currentColor" opacity="0.9" />
      {/* Head */}
      <circle cx="32" cy="22" r="12" fill="currentColor" />
      {/* Eye */}
      <circle cx="36" cy="20" r="2.5" fill="#1e293b" />
      <circle cx="37" cy="19" r="0.8" fill="white" />
      {/* Blush */}
      <ellipse cx="40" cy="24" rx="3" ry="1.5" fill="#fdba74" opacity="0.6" />
      {/* Beak */}
      <path d="M41 23 Q46 25 41 27 Q39 25 41 23Z" fill="#f97316" />
      {/* Wing sketch line */}
      <path d="M18 36 Q22 32 26 36 Q22 40 18 36Z" stroke="#d97706" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Feet */}
      <path d="M26 52 L22 56 L30 54" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M38 52 L34 56 L42 54" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* Duck with heart — love doodle */
export function DuckWithHeart({ className, size = 48 }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 64" width={size * 1.25} height={size} className={cn('text-amber-400', className)} fill="none">
      {/* Body */}
      <ellipse cx="32" cy="42" rx="16" ry="12" fill="currentColor" opacity="0.9" />
      {/* Head */}
      <circle cx="32" cy="26" r="10" fill="currentColor" />
      {/* Eye */}
      <circle cx="35" cy="24" r="2" fill="#1e293b" />
      <circle cx="35.8" cy="23.3" r="0.6" fill="white" />
      {/* Blush */}
      <ellipse cx="39" cy="27" rx="2.5" ry="1.2" fill="#fdba74" opacity="0.5" />
      {/* Beak */}
      <path d="M39 26 Q43 28 39 30 Q37.5 28 39 26Z" fill="#f97316" />
      {/* Heart floating above */}
      <path d="M55 12 C55 8 50 5 47 9 C44 5 39 8 39 12 C39 18 47 23 47 23 C47 23 55 18 55 12Z" fill="#f87171" opacity="0.7" />
      {/* Sparkle dots */}
      <circle cx="60" cy="8" r="1" fill="#fbbf24" opacity="0.6" />
      <circle cx="36" cy="5" r="0.8" fill="#fbbf24" opacity="0.5" />
    </svg>
  );
}

/* Two ducks together — couple doodle */
export function DuckCouple({ className, size = 60 }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 64" width={size * 1.56} height={size} className={cn('text-amber-400', className)} fill="none">
      {/* Left duck body */}
      <ellipse cx="30" cy="42" rx="14" ry="11" fill="currentColor" opacity="0.85" />
      <circle cx="30" cy="28" r="9" fill="currentColor" />
      <circle cx="33" cy="26" r="1.8" fill="#1e293b" />
      <circle cx="33.6" cy="25.4" r="0.5" fill="white" />
      <ellipse cx="36" cy="29" rx="2" ry="1" fill="#fdba74" opacity="0.5" />
      <path d="M36 27.5 Q39 29 36 31 Q34.5 29 36 27.5Z" fill="#f97316" />
      {/* Right duck body */}
      <ellipse cx="65" cy="42" rx="14" ry="11" fill="#fcd34d" opacity="0.85" />
      <circle cx="65" cy="28" r="9" fill="#fcd34d" />
      <circle cx="62" cy="26" r="1.8" fill="#1e293b" />
      <circle cx="61.4" cy="25.4" r="0.5" fill="white" />
      <ellipse cx="58" cy="29" rx="2" ry="1" fill="#fdba74" opacity="0.5" />
      <path d="M59 27.5 Q56 29 59 31 Q60.5 29 59 27.5Z" fill="#f97316" />
      {/* Heart between them */}
      <path d="M49 16 C49 13 46 11 44 14 C42 11 39 13 39 16 C39 20 44 23 44 23 C44 23 49 20 49 16Z" fill="#f87171" opacity="0.5" />
      {/* Connection line (like holding hands) */}
      <path d="M42 42 Q47.5 38 53 42" stroke="#d97706" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
    </svg>
  );
}

/* Sleeping duck — cozy doodle */
export function DuckSleeping({ className, size = 40 }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn('text-amber-400', className)} fill="none">
      {/* Body */}
      <ellipse cx="32" cy="42" rx="18" ry="13" fill="currentColor" opacity="0.9" />
      {/* Head tucked in */}
      <circle cx="28" cy="30" r="10" fill="currentColor" />
      {/* Closed eye (curved line) */}
      <path d="M31 28 Q33 30 35 28" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="36" cy="31" rx="2.5" ry="1.2" fill="#fdba74" opacity="0.5" />
      {/* Beak */}
      <path d="M36 30 Q39 32 36 33" stroke="#f97316" strokeWidth="1.2" fill="#f97316" opacity="0.7" />
      {/* Zzz */}
      <text x="44" y="18" fontSize="8" fill="#94a3b8" opacity="0.5" fontWeight="bold">z</text>
      <text x="50" y="12" fontSize="10" fill="#94a3b8" opacity="0.4" fontWeight="bold">z</text>
      <text x="57" y="6" fontSize="12" fill="#94a3b8" opacity="0.3" fontWeight="bold">z</text>
    </svg>
  );
}

/* Small duck head — for inline use */
export function DuckHead({ className, size = 20 }: DoodleProps) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={cn('text-amber-400', className)} fill="none">
      <circle cx="16" cy="16" r="11" fill="currentColor" />
      <circle cx="19" cy="14" r="2" fill="#1e293b" />
      <circle cx="19.6" cy="13.4" r="0.5" fill="white" />
      <ellipse cx="22" cy="17" rx="2" ry="1" fill="#fdba74" opacity="0.5" />
      <path d="M22 15.5 Q25 17 22 19 Q20.5 17 22 15.5Z" fill="#f97316" />
    </svg>
  );
}

/* Decorative wavy line with duck footprints */
export function DuckFootprints({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 16" className={cn('w-full h-4', className)} fill="none">
      {[0, 40, 80, 120, 160].map((x, i) => (
        <g key={i} opacity={0.15 + (i % 2) * 0.05}>
          <path d={`M${x + 10} 10 L${x + 7} 6 M${x + 10} 10 L${x + 10} 5 M${x + 10} 10 L${x + 13} 6`}
            stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
          <path d={`M${x + 25} 12 L${x + 22} 8 M${x + 25} 12 L${x + 25} 7 M${x + 25} 12 L${x + 28} 8`}
            stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/* Section divider with cute duck */
export function DuckDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 py-1', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
      <DuckHead size={14} className="opacity-30" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200/40 to-transparent" />
    </div>
  );
}

/* Decorative corner doodle */
export function CornerDoodle({ position = 'top-right', className }: { position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; className?: string }) {
  const posClass = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2 -scale-x-100',
    'bottom-right': 'bottom-2 right-2 -scale-y-100',
    'bottom-left': 'bottom-2 left-2 -scale-x-100 -scale-y-100',
  }[position];

  return (
    <svg viewBox="0 0 40 40" width={32} height={32} className={cn('absolute opacity-[0.07]', posClass, className)} fill="none">
      <path d="M35 5 Q30 5 28 10 Q26 15 20 18 Q14 21 10 28 Q8 32 5 35" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="35" cy="5" r="2" fill="#f59e0b" />
      <path d="M30 12 L33 10 M30 12 L32 14" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/* Floating sparkle stars */
export function SparkleStars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 20" className={cn('w-full h-5 opacity-20', className)} fill="none">
      {[15, 40, 65, 85].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 10 L${x + 1.5} 7 L${x + 3} 10 L${x + 1.5} 13Z`} fill="#fbbf24" opacity={0.4 + i * 0.1} />
          <path d={`M${x - 1} 10 L${x + 1.5} 8.5 M${x + 4} 10 L${x + 1.5} 11.5`} stroke="#fbbf24" strokeWidth="0.5" opacity={0.3} />
        </g>
      ))}
    </svg>
  );
}

/* Tiny leaf doodle */
export function LeafDoodle({ className, size = 16 }: DoodleProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={cn('text-emerald-400', className)} fill="none">
      <path d="M10 18 Q6 14 4 8 Q4 3 10 2 Q16 3 16 8 Q14 14 10 18Z" fill="currentColor" opacity="0.3" />
      <path d="M10 18 Q10 10 10 2" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M7 12 Q10 10 13 12" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    </svg>
  );
}

/* Small flower doodle */
export function FlowerDoodle({ className, size = 18 }: DoodleProps) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={cn('text-pink-300', className)} fill="none">
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 10 + Math.cos(rad) * 5;
        const cy = 10 + Math.sin(rad) * 5;
        return <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" opacity="0.5" />;
      })}
      <circle cx="10" cy="10" r="2.5" fill="#fbbf24" opacity="0.7" />
    </svg>
  );
}
