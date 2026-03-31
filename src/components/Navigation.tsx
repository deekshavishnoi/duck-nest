'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, CalendarHeart, Camera, ShoppingCart, ListChecks, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', label: 'Nest', icon: Heart },
  { href: '/dates', label: 'Dates', icon: CalendarHeart },
  { href: '/memories', label: 'Memories', icon: Camera },
  { href: '/shopping', label: 'Shop', icon: ShoppingCart },
  { href: '/chores', label: 'Chores', icon: ListChecks },
  { href: '/profile', label: 'Us', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)]/90 backdrop-blur-xl border-t border-amber-100">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors relative min-w-0 flex-shrink-0',
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
  );
}