'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart, CalendarHeart, Camera, ShoppingCart, ListChecks, User,
  BookOpen, Tv, Menu, X,
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)]/90 backdrop-blur-xl border-b border-blue-100">
          <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2.5">
            <Link href="/" className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              🦆 DuckNest
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
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
                className="fixed top-0 right-0 bottom-0 z-50 w-64 bg-[var(--bg)] border-l border-blue-100 shadow-xl pt-14 px-4 pb-6 overflow-y-auto"
              >
                <div className="space-y-1">
                  {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                          isActive
                            ? 'bg-blue-50/80 text-blue-600 font-semibold'
                            : 'text-slate-400 hover:bg-blue-50/50 hover:text-slate-600 font-medium'
                        )}
                      >
                        <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
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
      <nav className="hidden sm:block fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)]/90 backdrop-blur-xl border-t border-blue-100">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors relative min-w-0 flex-shrink-0',
                  isActive ? 'text-blue-600' : 'text-slate-400/60 hover:text-blue-400'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-50/70 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4.5 h-4.5 relative z-10" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className={cn('text-[9px] relative z-10', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}