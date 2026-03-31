'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { ChoreTab, Difficulty, Chore, DIFFICULTY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus, Trash2, Check, X, Calendar, ChevronDown, ChevronUp, Heart,
} from 'lucide-react';

const TAB_KEYS: ChoreTab[] = ['user1', 'user2', 'together'];
const TAB_EMOJI: Record<ChoreTab, string> = { user1: '🐥', user2: '🐤', together: '🦆' };
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export default function Chores() {
  const {
    data, currentUser, partner, canEditTab, getTabLabel, addChore, deleteChore, toggleChoreComplete, toggleSubTask,
  } = useApp();
  const [activeTab, setActiveTab] = useState<ChoreTab>('together');
  const [showAdd, setShowAdd] = useState(false);

  const chores = data.chores.filter((c) => c.tab === activeTab);
  const active = chores.filter((c) => !c.completed);
  const done = chores.filter((c) => c.completed);
  const editable = canEditTab(activeTab);

  // Map current tab to score key
  const scoreKey = activeTab === 'together' ? 'together' : activeTab;
  const scoreValue = data.scores[scoreKey];
  const isOwnTab = (activeTab === 'user1' && currentUser?.role === 'primary') ||
                   (activeTab === 'user2' && currentUser?.role === 'partner') ||
                   activeTab === 'together';

  return (
    <div className="space-y-5">
      {/* Soft score banner */}
      {isOwnTab && (
        <div className="duck-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-amber-600/50">
              {activeTab === 'together' ? 'How well we\'re handling life together' : 'Your personal progress'}
            </p>
            <span className="text-lg">{activeTab === 'together' ? '🦆' : '✨'}</span>
          </div>
          <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700"
              style={{ width: `${Math.min(scoreValue, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-amber-400">{scoreValue.toFixed(0)} pts</span>
            {scoreValue >= 100 && (
              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                <Heart className="w-3 h-3" fill="currentColor" /> Amazing teamwork!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Chores</h1>
          <p className="text-sm text-amber-600/40">{partner ? 'teamwork makes the dream work' : 'your task tracker'}</p>
        </div>
        {editable && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="duck-btn-soft flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            New chore
          </motion.button>
        )}
      </div>

      {!editable && (
        <div className="bg-amber-50 rounded-xl px-4 py-2 text-center border border-amber-200">
          <p className="text-[10px] text-amber-600">👀 You&apos;re viewing — only they can edit their chores</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5',
              activeTab === key
                ? 'bg-white shadow-sm border border-amber-200 text-amber-800'
                : 'bg-transparent text-amber-500/50 hover:bg-white/50'
            )}
          >
            <span>{TAB_EMOJI[key]}</span> {getTabLabel(key)}
          </button>
        ))}
      </div>

      {/* Active chores */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {active.map((chore, i) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              index={i}
              editable={editable}
              onDelete={() => deleteChore(chore.id)}
              onToggleComplete={() => toggleChoreComplete(chore.id)}
              onToggleSubTask={(subId) => toggleSubTask(chore.id, subId)}
            />
          ))}
        </AnimatePresence>
      </div>

      {active.length === 0 && done.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">✨</p>
          <p className="text-sm text-amber-600/40">No chores yet. Add one!</p>
        </div>
      )}

      {/* Completed section */}
      {done.length > 0 && (
        <CompletedSection
          chores={done}
          editable={editable}
          onToggleComplete={toggleChoreComplete}
          onDelete={deleteChore}
        />
      )}

      {/* Add Chore Modal */}
      <AnimatePresence>
        {showAdd && (
          <AddChoreModal
            tab={activeTab}
            onClose={() => setShowAdd(false)}
            onAdd={addChore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoreCard({
  chore, index, editable, onDelete, onToggleComplete, onToggleSubTask,
}: {
  chore: Chore;
  index: number;
  editable: boolean;
  onDelete: () => void;
  onToggleComplete: () => void;
  onToggleSubTask: (subId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY_CONFIG[chore.difficulty];
  const subDone = chore.subtasks.filter((s) => s.checked).length;
  const isOverdue = chore.deadline && new Date(chore.deadline) < new Date() && !chore.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'duck-card overflow-hidden',
        isOverdue && 'ring-2 ring-red-300/50'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => editable && onToggleComplete()}
              disabled={!editable}
              className={cn(
                'mt-0.5 w-5 h-5 rounded-md border-2 border-amber-200 hover:border-green-300 flex items-center justify-center transition-all flex-shrink-0',
                !editable && 'opacity-60 cursor-default'
              )}
            >
              {chore.completed && <Check className="w-3 h-3 text-green-500" />}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-amber-800">{chore.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', diff.color)}>
                  {diff.emoji} {diff.label} ({diff.points}pt)
                </span>
                {chore.deadline && (
                  <span className={cn(
                    'text-[10px] flex items-center gap-1',
                    isOverdue ? 'text-red-400' : 'text-amber-400'
                  )}>
                    <Calendar className="w-3 h-3" />
                    {new Date(chore.deadline).toLocaleDateString('en-DE', { day: 'numeric', month: 'short' })}
                    {isOverdue && ' (overdue!)'}
                  </span>
                )}
                {chore.subtasks.length > 0 && (
                  <span className="text-[10px] text-amber-400">{subDone}/{chore.subtasks.length} sub-tasks</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {chore.subtasks.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-amber-600 transition-colors">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
            {editable && (
              <button onClick={onDelete} className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-tasks progress */}
        {chore.subtasks.length > 0 && (
          <div className="w-full h-1 bg-amber-100 rounded-full mt-3 overflow-hidden">
            <motion.div
              className="h-full bg-amber-400 rounded-full"
              animate={{ width: `${(subDone / chore.subtasks.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Expanded sub-tasks */}
      <AnimatePresence>
        {expanded && chore.subtasks.length > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1 border-t border-amber-100 pt-3">
              {chore.subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2">
                  <button
                    onClick={() => editable && onToggleSubTask(sub.id)}
                    disabled={!editable}
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0',
                      sub.checked
                        ? 'bg-amber-100 border-amber-300 text-amber-600'
                        : 'border-amber-200 hover:border-amber-400',
                      !editable && 'opacity-60 cursor-default'
                    )}
                  >
                    {sub.checked && <Check className="w-2.5 h-2.5" />}
                  </button>
                  <span className={cn(
                    'text-xs transition-colors',
                    sub.checked ? 'text-amber-400 line-through' : 'text-amber-700/60'
                  )}>
                    {sub.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompletedSection({
  chores, editable, onToggleComplete, onDelete,
}: {
  chores: Chore[];
  editable: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-amber-500/50 hover:text-amber-700 transition-colors"
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {chores.length} completed
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2 space-y-2"
          >
            {chores.map((chore) => {
              const diff = DIFFICULTY_CONFIG[chore.difficulty];
              return (
                <div key={chore.id} className="bg-amber-50/50 rounded-xl p-3 flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => editable && onToggleComplete(chore.id)}
                      disabled={!editable}
                      className={cn(
                        'w-5 h-5 rounded-md bg-green-100 border-2 border-green-300 text-green-500 flex items-center justify-center',
                        !editable && 'opacity-60 cursor-default'
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-amber-500 line-through">{chore.title}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full opacity-60', diff.color)}>{diff.emoji}</span>
                  </div>
                  {editable && (
                    <button onClick={() => onDelete(chore.id)} className="text-amber-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddChoreModal({
  tab, onClose, onAdd,
}: {
  tab: ChoreTab;
  onClose: () => void;
  onAdd: (chore: { title: string; tab: ChoreTab; difficulty: Difficulty; deadline?: string; subtasks: { text: string }[] }) => void;
}) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [deadline, setDeadline] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);

  const addSub = () => {
    const t = subtaskInput.trim();
    if (!t) return;
    setSubtasks((prev) => [...prev, t]);
    setSubtaskInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      tab,
      difficulty,
      deadline: deadline || undefined,
      subtasks: subtasks.map((s) => ({ text: s })),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="duck-card p-6 w-full max-w-md space-y-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-amber-800">New Chore</h2>
          <button type="button" onClick={onClose} className="text-amber-400 hover:text-amber-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full duck-input"
          autoFocus
        />

        <div>
          <p className="text-xs text-amber-500/50 mb-2">Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => {
              const cfg = DIFFICULTY_CONFIG[d];
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    'text-xs px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1',
                    difficulty === d ? cfg.color : 'bg-amber-50 text-amber-500'
                  )}
                >
                  {cfg.emoji} {cfg.label} ({cfg.points}pt)
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-amber-500/50 mb-2">Deadline (optional)</p>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full duck-input" />
        </div>

        <div>
          <p className="text-xs text-amber-500/50 mb-2">Sub-tasks</p>
          <div className="space-y-1 mb-2">
            {subtasks.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-amber-700/60">
                <span className="w-4 h-4 rounded border border-amber-200 flex-shrink-0" />
                <span className="flex-1">{s}</span>
                <button type="button" onClick={() => setSubtasks((prev) => prev.filter((_, j) => j !== i))} className="text-amber-300 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub(); } }}
              placeholder="Add sub-task..."
              className="flex-1 duck-input text-xs"
            />
            <button type="button" onClick={addSub} className="text-xs bg-amber-100 text-amber-600 px-3 py-1.5 rounded-xl hover:bg-amber-200 transition-colors">
              Add
            </button>
          </div>
        </div>

        <button type="submit" className="w-full duck-btn py-3 text-sm">
          Add chore 🐥
        </button>
      </motion.form>
    </motion.div>
  );
}