'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { daysSince } from '@/lib/utils';

export default function CountdownTimer() {
  const { data, partner, myDisplayName, partnerDisplayName } = useApp();
  const [days, setDays] = useState(0);

  useEffect(() => {
    setDays(daysSince(data.couple.anniversary));
  }, [data.couple.anniversary]);

  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const subtitle = partner
    ? `${myDisplayName} & ${partnerDisplayName} — together for`
    : 'Your nest has been cozy for';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="duck-card-warm p-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <span className="text-xl">🦆</span>
        </div>
        <div>
          <p className="text-xs text-blue-600/50">
            {subtitle}
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {days} <span className="text-sm font-normal text-amber-600/40">days</span>
          </p>
          {months > 0 && (
            <p className="text-[10px] text-slate-400">
              that&apos;s {years > 0 ? `${years} year${years > 1 ? 's' : ''} and ` : ''}{months % 12} month{months % 12 !== 1 ? 's' : ''}!
            </p>
          )}
        </div>
        <div className="ml-auto text-right">
          <p className="text-lg">🌻</p>
          <p className="text-[10px] text-blue-500/40">and counting</p>
        </div>
      </div>
    </motion.div>
  );
}
