'use client';

import { useApp } from '@/hooks/useAppData';
import Onboarding from '@/components/Onboarding';
import Navigation from '@/components/Navigation';
import DuckDecorations from '@/components/HeartAnimation';
import { motion } from 'framer-motion';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useApp();

  // Still loading from localStorage — show splash
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fef9ef]">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl mb-3"
        >
          🦆
        </motion.div>
        <p className="text-sm text-amber-600/40">Loading your nest...</p>
      </div>
    );
  }

  // Not logged in → show onboarding / auth
  if (!isLoggedIn) {
    return <Onboarding />;
  }

  // Authenticated → show app
  return (
    <>
      <DuckDecorations />
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-14 sm:pt-6 pb-28 sm:pb-28 min-h-screen">
        {children}
      </main>
      <Navigation />
    </>
  );
}
