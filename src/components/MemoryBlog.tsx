'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { formatDate } from '@/lib/utils';
import { Trash2, X } from 'lucide-react';
import { DuckSleeping } from '@/components/ui/DuckDoodles';

export default function MemoryBlog() {
  const { data, deleteMemory } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...data.memories].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  const selected = sorted.find((m) => m.id === selectedId);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-800">Memories</h1>
        <p className="text-sm text-amber-600/40">
          {data.memories.length} moment{data.memories.length !== 1 ? 's' : ''} captured
        </p>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16">
          <DuckSleeping className="mx-auto mb-3 text-amber-400/60" size={64} />
          <p className="text-sm text-amber-600/50">No memories yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Complete a date and upload a photo to start your scrapbook 🐥
          </p>
        </div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3">
        {sorted.map((memory, i) => (
          <motion.button
            key={memory.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedId(memory.id)}
            className="relative aspect-square rounded-2xl overflow-hidden group bg-blue-50"
          >
            <img
              src={memory.imageUrl}
              alt={memory.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-xs font-semibold drop-shadow-sm truncate">
                {memory.title}
              </p>
              <p className="text-white/70 text-[10px] drop-shadow-sm">
                {formatDate(memory.completedAt)}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Full-view modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="duck-card overflow-hidden w-full max-w-md"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-slate-700">{selected.title}</h3>
                {selected.caption && (
                  <p className="text-sm text-slate-600/60 italic">&ldquo;{selected.caption}&rdquo;</p>
                )}
                <p className="text-xs text-slate-400">
                  {formatDate(selected.completedAt)}
                </p>
                <button
                  onClick={() => { deleteMemory(selected.id); setSelectedId(null); }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove memory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}