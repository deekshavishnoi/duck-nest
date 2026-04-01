'use client';

import { useState } from 'react';
import { useApp } from '@/hooks/useAppData';
import Onboarding from '@/components/Onboarding';
import Navigation from '@/components/Navigation';
import DuckDecorations from '@/components/HeartAnimation';
import { motion } from 'framer-motion';
import { Mail, X } from 'lucide-react';

function EmailVerificationBanner() {
  const { emailVerified, resendVerificationEmail, firebaseUser } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Don't show for Google users (already verified) or if dismissed
  if (emailVerified || dismissed || !firebaseUser) return null;

  const handleResend = async () => {
    setSending(true);
    const result = await resendVerificationEmail();
    setSending(false);
    if (result.success) setSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-4 flex items-start gap-3"
    >
      <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-xs text-slate-600">
        <p className="font-medium text-slate-700">Verify your email</p>
        <p className="mt-0.5">
          Check <strong>{firebaseUser.email}</strong> for a verification link.
          {!sent ? (
            <button
              onClick={handleResend}
              disabled={sending}
              className="ml-1 text-blue-500 hover:text-blue-600 underline disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend'}
            </button>
          ) : (
            <span className="ml-1 text-green-600">Sent!</span>
          )}
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, data } = useApp();

  // Detect invite link in URL (partner clicking shared link)
  // Use state to avoid stale reads after history.replaceState
  const [inviteFromURL] = useState(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('invite');
  });

  // Still loading from localStorage + Firebase — show splash
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
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

  // Fully authenticated and onboarding complete → show app
  // (skip the invite check if partner already joined or user is logged in with completed onboarding)
  const showOnboarding = !isLoggedIn
    || (!data.onboardingComplete && inviteFromURL && !data.invite.partnerJoined);

  if (showOnboarding) {
    return <Onboarding />;
  }

  // Authenticated → show app
  return (
    <>
      <DuckDecorations />
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-14 sm:pt-6 pb-28 sm:pb-28 min-h-screen">
        <EmailVerificationBanner />
        {children}
      </main>
      <Navigation />
    </>
  );
}
