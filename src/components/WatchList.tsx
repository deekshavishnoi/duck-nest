'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { WatchType, WatchStatus, WatchItem, WATCH_TYPE_CONFIG, WATCH_STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X, Pencil, Tv, Check } from 'lucide-react';

const TYPE_KEYS: WatchType[] = ['movie', 'series', 'documentary'];
const STATUS_KEYS: WatchStatus[] = ['want-to-watch', 'watching', 'watched'];

export default function WatchList() {
  const {
    data, addWatchItem, updateWatchItem, deleteWatchItem, partner, isLoggedIn,
  } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<WatchStatus | 'all'>('all');

  const allItems = data.watchList ?? [];
  const items = filterStatus === 'all' ? allItems : allItems.filter((w) => w.status === filterStatus);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Watch List</h1>
          <p className="text-sm text-amber-600/40">{partner ? 'movies & shows for two 🍿' : 'your watch queue'}</p>
        </div>
        {isLoggedIn && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="duck-btn-soft flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </motion.button>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <FilterButton label="All" emoji="🎯" count={allItems.length} active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
        {STATUS_KEYS.map((s) => {
          const cfg = WATCH_STATUS_CONFIG[s];
          const count = allItems.filter((w) => w.status === s).length;
          return (
            <FilterButton key={s} label={cfg.label} emoji={cfg.emoji} count={count} active={filterStatus === s} onClick={() => setFilterStatus(s)} />
          );
        })}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <AddWatchForm
            onAdd={(item) => { addWatchItem(item); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
          />
        )}
      </AnimatePresence>

      {/* Items */}
      {items.length === 0 && !showAdd ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="duck-card text-center py-12"
        >
          <Tv className="w-10 h-10 text-amber-300 mx-auto mb-3" />
          <p className="text-sm text-amber-700/60">
            {filterStatus === 'all' ? 'No items yet — add something to watch!' : 'Nothing in this category'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <WatchCard
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                onEdit={() => setEditingId(item.id)}
                onCancelEdit={() => setEditingId(null)}
                onUpdate={(updates) => { updateWatchItem(item.id, updates); setEditingId(null); }}
                onDelete={() => deleteWatchItem(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ---- Filter Button ---- */
function FilterButton({ label, emoji, count, active, onClick }: {
  label: string; emoji: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap',
        active ? 'bg-white shadow-sm border border-amber-200 text-amber-800' : 'bg-transparent text-amber-500/50 hover:bg-white/50'
      )}
    >
      <span>{emoji}</span> {label}
      {count > 0 && <span className="text-amber-400 ml-0.5">({count})</span>}
    </button>
  );
}

/* ---- Add Watch Form ---- */
function AddWatchForm({
  onAdd,
  onCancel,
}: {
  onAdd: (item: { title: string; type: WatchType; status: WatchStatus; notes?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WatchType>('movie');
  const [status, setStatus] = useState<WatchStatus>('want-to-watch');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), type, status, notes: notes.trim() || undefined });
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="duck-card space-y-3 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-800">Add to watch list</h3>
        <button type="button" onClick={onCancel} className="text-amber-400 hover:text-amber-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <input
        className="duck-input w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      {/* Type selector */}
      <div>
        <label className="text-[10px] text-amber-600/60 font-medium mb-1 block">Type</label>
        <div className="flex gap-2">
          {TYPE_KEYS.map((t) => {
            const cfg = WATCH_TYPE_CONFIG[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                  type === t ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-white/50 text-amber-500/50'
                )}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
      {/* Status selector */}
      <div>
        <label className="text-[10px] text-amber-600/60 font-medium mb-1 block">Status</label>
        <div className="flex gap-2">
          {STATUS_KEYS.map((s) => {
            const cfg = WATCH_STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                  status === s ? cfg.color + ' ring-1 ring-current/20' : 'bg-white/50 text-amber-500/50'
                )}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
      </div>
      <textarea
        className="duck-input w-full resize-none"
        placeholder="Notes (optional)"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="duck-btn w-full py-2 rounded-xl text-sm font-medium disabled:opacity-40"
      >
        Add to list
      </button>
    </motion.form>
  );
}

/* ---- Watch Card ---- */
function WatchCard({
  item,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
}: {
  item: WatchItem;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<WatchItem>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState(item.type);
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.notes || '');

  if (isEditing) {
    return (
      <motion.div layout className="duck-card space-y-3">
        <input className="duck-input w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          {TYPE_KEYS.map((t) => {
            const cfg = WATCH_TYPE_CONFIG[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                  type === t ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-white/50 text-amber-500/50'
                )}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          {STATUS_KEYS.map((s) => {
            const cfg = WATCH_STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                  status === s ? cfg.color + ' ring-1 ring-current/20' : 'bg-white/50 text-amber-500/50'
                )}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
        <textarea className="duck-input w-full resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={() => onUpdate({ title: title.trim(), type, status, notes: notes.trim() || undefined })} className="duck-btn flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1">
            <Check className="w-3 h-3" /> Save
          </button>
          <button onClick={onCancelEdit} className="duck-btn-soft flex-1 py-1.5 rounded-lg text-xs">Cancel</button>
        </div>
      </motion.div>
    );
  }

  const typeCfg = WATCH_TYPE_CONFIG[item.type];
  const statusCfg = WATCH_STATUS_CONFIG[item.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="duck-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="text-sm font-semibold text-amber-900 truncate">{item.title}</h4>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 whitespace-nowrap">
              {typeCfg.emoji} {typeCfg.label}
            </span>
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap', statusCfg.color)}>
              {statusCfg.emoji} {statusCfg.label}
            </span>
          </div>
          {item.notes && <p className="text-xs text-amber-700/50 mt-1 line-clamp-2">{item.notes}</p>}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-amber-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
