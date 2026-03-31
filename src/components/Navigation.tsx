'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart, CalendarHeart, Camera, ShoppingCart, ListChecks, User,
  BookOpen, Tv, Menu, X, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', label: 'Nest', icon: Heart },
  { href: '/dates', label: 'Dates', icon: CalendarHeart },
  { href: '/memories', label: 'Memories', icon: Camera },
  { href: '/shopping', label: 'Shop', icon: ShoppingCart },
  { href: '/chores', label: 'Chores', icon: ListChecks },
  { href: '/reading', label: 'Reading', icon: BookOpen },
  { href: '/watchlist', label: 'Watch', icon: Tv },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/profile', label: 'Us', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      {/* ========== MOBILE: top bar + hamburger drawer ========== */}
      <div className="sm:hidden">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)]/90 backdrop-blur-xl border-b border-amber-100">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2.5">
            <Link href="/" className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
              🦆 DuckNest
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Drawer overlay */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              />
              <motion.nav
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-[var(--bg)] border-l border-amber-100 shadow-xl pt-14 px-4 pb-6 overflow-y-auto"
              >
                <div className="space-y-1">
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'text-amber-600/60 hover:bg-amber-50/50 hover:text-amber-700'
                        )}
                      >
                        <Icon className="w-4.5 h-4.5" fill={isActive ? 'currentColor' : 'none'} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ========== DESKTOP: bottom tab bar ========== */}
      <nav className="hidden sm:block fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)]/90 backdrop-blur-xl border-t border-amber-100">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors relative min-w-0 flex-shrink-0',
                  isActive ? 'text-amber-600' : 'text-amber-400/50 hover:text-amber-500'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-amber-50 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4.5 h-4.5 relative z-10" fill={isActive ? 'currentColor' : 'none'} />
                <span className="text-[9px] font-medium relative z-10">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}