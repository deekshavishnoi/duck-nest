'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ELEMENTS = ['🐥', '🌼', '🌿', '🦆', '🌸', '🐤', '🍃', '🌻'];

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
      emoji: ELEMENTS[i % ELEMENTS.length],
      size: 14 + Math.random() * 14,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 6,
    }));
    setItems(generated);
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute opacity-30"
            style={{ left: `${item.x}%`, fontSize: item.size }}
            initial={{ y: '110vh', opacity: 0, rotate: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.35, 0.35, 0],
              rotate: [0, 10, -10, 0],
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