'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ELEMENTS = [
  { emoji: '🐥', scale: 1 },
  { emoji: '🌼', scale: 0.9 },
  { emoji: '🌿', scale: 0.8 },
  { emoji: '🦆', scale: 1.1 },
  { emoji: '🌸', scale: 0.9 },
  { emoji: '🐤', scale: 1 },
  { emoji: '🍃', scale: 0.7 },
  { emoji: '💛', scale: 0.8 },
];

interface FloatingItem {
  id: number;
  x: number;
  emoji: string;
  size: number;
  duration: number;
  delay: number;
}

export default function DuckDecorations({ count = 8 }: { count?: number }) {
  const [items, setItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    const generated: FloatingItem[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      emoji: ELEMENTS[i % ELEMENTS.length].emoji,
      size: (12 + Math.random() * 12) * ELEMENTS[i % ELEMENTS.length].scale,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 8,
    }));
    setItems(generated);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Soft ambient glow spots */}
      <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-amber-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[8%] w-28 h-28 bg-blue-100/15 rounded-full blur-3xl" />
      <div className="absolute top-[60%] left-[50%] w-24 h-24 bg-pink-100/10 rounded-full blur-3xl" />

      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute"
            style={{ left: `${item.x}%`, fontSize: item.size, filter: 'saturate(0.7)' }}
            initial={{ y: '110vh', opacity: 0, rotate: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.25, 0.25, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}