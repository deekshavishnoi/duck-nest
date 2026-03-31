'use client';

import { motion } from 'framer-motion';
import { MOOD_CONFIG, Mood } from '@/types';
import { cn } from '@/lib/utils';

interface MoodPickerProps {
  selected: Mood;
  onSelect: (mood: Mood) => void;
  label: string;
}

export default function MoodPicker({ selected, onSelect, label }: MoodPickerProps) {
  const moods = Object.entries(MOOD_CONFIG) as [Mood, (typeof MOOD_CONFIG)[Mood]][];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-amber-700">{label}</p>
      <div className="flex flex-wrap gap-2">
        {moods.map(([key, config]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              selected === key
                ? `${config.color} border-current shadow-sm`
                : 'bg-amber-50/50 text-amber-600/40 border-amber-100 hover:bg-amber-50'
            )}
          >
            <span className="text-base">{config.emoji}</span>
            {config.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
