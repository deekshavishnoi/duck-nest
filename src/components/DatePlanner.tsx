'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { DATE_CATEGORY_CONFIG, DateCategory, DateIdea, ChecklistItem } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import {
  Plus, Shuffle, Check, Trash2, Sparkles, X, MapPin, Clock,
  Pencil, ExternalLink, ListChecks, CalendarHeart, ChevronDown,
  ChevronUp, AlertCircle, Upload,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function daysUntil(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getApproachingDates(dates: DateIdea[]): DateIdea[] {
  return dates
    .filter((d) => !d.done && d.scheduledFor)
    .filter((d) => {
      const days = daysUntil(d.scheduledFor!);
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime());
}

export default function DatePlanner() {
  const { data, addDateIdea, updateDateIdea, completeDateWithMemory, undoDateComplete, deleteDateIdea, toggleChecklistItem } = useApp();
  const [filter, setFilter] = useState<DateCategory | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [surprise, setSurprise] = useState<DateIdea | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [completingDate, setCompletingDate] = useState<DateIdea | null>(null);

  const upcoming = data.dates.filter((d) => !d.done);
  const completed = data.dates.filter((d) => d.done);
  const filtered = filter === 'all' ? upcoming : upcoming.filter((d) => d.category === filter);
  const approaching = useMemo(() => getApproachingDates(data.dates), [data.dates]);

  const handleSurprise = () => {
    if (upcoming.length === 0) return;
    const pick = upcoming[Math.floor(Math.random() * upcoming.length)];
    setSurprise(pick);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Our Dates</h1>
          <p className="text-sm text-amber-600/40">
            {upcoming.length} adventure{upcoming.length !== 1 ? 's' : ''} waiting · {completed.length} done
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSurprise}
            className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-600 px-3 py-2 rounded-full hover:bg-amber-100 transition-colors font-medium"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Surprise us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingId(null); setShowAdd(true); }}
            className="duck-btn-soft flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </motion.button>
        </div>
      </div>

      {/* Approaching Date Reminders */}
      <AnimatePresence>
        {approaching.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {approaching.map((date) => {
              const days = daysUntil(date.scheduledFor!);
              return (
                <div
                  key={`reminder-${date.id}`}
                  className="duck-card-warm p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <CalendarHeart className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amber-700">
                      {days === 0
                        ? "Today's the day! 🎉"
                        : days === 1
                          ? 'Tomorrow! Adventure time is almost here 🐥'
                          : `Coming up in ${days} days ✨`}
                    </p>
                    <p className="text-[11px] text-amber-600/50 truncate">
                      {date.emoji} {date.title}
                      {date.location && ` · ${date.location}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Surprise Modal */}
      <AnimatePresence>
        {surprise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="duck-card-warm p-6 text-center"
          >
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-xs text-amber-500 font-medium mb-1">Your next adventure is...</p>
            <p className="text-xl font-bold text-amber-900 mb-1">
              {surprise.emoji} {surprise.title}
            </p>
            <p className="text-sm text-amber-700/60 mb-3">{surprise.description}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { setCompletingDate(surprise); setSurprise(null); }}
                className="text-xs bg-green-50 text-green-600 px-4 py-2 rounded-full hover:bg-green-100 transition-colors font-medium"
              >
                Let&apos;s do it! ✓
              </button>
              <button
                onClick={() => setSurprise(null)}
                className="text-xs bg-amber-50 text-amber-500 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors font-medium"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full font-medium transition-all',
            filter === 'all' ? 'bg-amber-800 text-white' : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
          )}
        >
          All
        </button>
        {(Object.entries(DATE_CATEGORY_CONFIG) as [DateCategory, (typeof DATE_CATEGORY_CONFIG)[DateCategory]][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1',
                filter === key ? `${cfg.color} shadow-sm` : 'bg-amber-50 text-amber-500 hover:bg-amber-100'
              )}
            >
              {cfg.emoji} {cfg.label}
            </button>
          )
        )}
      </div>

      {/* Upcoming Date List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((idea, i) => (
            <DateCard
              key={idea.id}
              idea={idea}
              index={i}
              expanded={expandedId === idea.id}
              onToggleExpand={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              onToggleDone={() => setCompletingDate(idea)}
              onDelete={() => deleteDateIdea(idea.id)}
              onEdit={() => { setEditingId(idea.id); setShowAdd(true); }}
              onToggleChecklist={(itemId) => toggleChecklistItem(idea.id, itemId)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && !showCompleted && (
        <div className="text-center py-10">
          <p className="text-4xl mb-2">🦆</p>
          <p className="text-sm text-amber-600/40">
            No date ideas here yet. Plan your next adventure together!
          </p>
        </div>
      )}

      {/* Completed Section */}
      {completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-amber-600/40 hover:text-amber-700 transition-colors font-medium w-full"
          >
            {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Completed adventures ({completed.length})
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-3"
              >
                {completed.map((idea, i) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white/60 rounded-2xl p-3 border border-green-100 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{idea.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-amber-700/50 line-through">{idea.title}</h3>
                        {idea.completedAt && (
                          <p className="text-[10px] text-amber-400">{formatDate(idea.completedAt)}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => undoDateComplete(idea.id)}
                          className="p-1.5 rounded-lg bg-green-50 text-green-400 hover:text-orange-400 hover:bg-orange-50 transition-colors"
                          title="Undo"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDateIdea(idea.id)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <DateFormModal
            existingDate={editingId ? data.dates.find((d) => d.id === editingId) : undefined}
            onClose={() => { setShowAdd(false); setEditingId(null); }}
            onAdd={addDateIdea}
            onUpdate={updateDateIdea}
          />
        )}
      </AnimatePresence>

      {/* Memory Capture Modal */}
      <AnimatePresence>
        {completingDate && (
          <MemoryCaptureModal
            date={completingDate}
            onClose={() => setCompletingDate(null)}
            onComplete={(imageUrl, caption) => {
              completeDateWithMemory(completingDate.id, imageUrl, caption);
              setCompletingDate(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Date Card ---- */
function DateCard({
  idea, index, expanded, onToggleExpand, onToggleDone, onDelete, onEdit, onToggleChecklist,
}: {
  idea: DateIdea;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onToggleChecklist: (itemId: string) => void;
}) {
  const hasDetails = idea.location || idea.notes || idea.itinerary || idea.scheduledFor || (idea.checklist && idea.checklist.length > 0);
  const isApproaching = idea.scheduledFor && daysUntil(idea.scheduledFor) >= 0 && daysUntil(idea.scheduledFor) <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        'duck-card overflow-hidden',
        isApproaching && 'ring-2 ring-amber-300/50'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">{idea.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-sm text-amber-900">{idea.title}</h3>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium',
                  DATE_CATEGORY_CONFIG[idea.category].color
                )}
              >
                {DATE_CATEGORY_CONFIG[idea.category].label}
              </span>
              {isApproaching && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-0.5">
                  <AlertCircle className="w-2.5 h-2.5" />
                  Soon!
                </span>
              )}
            </div>
            <p className="text-xs text-amber-700/50">{idea.description}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {idea.scheduledFor && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(idea.scheduledFor)}
                </span>
              )}
              {idea.location && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {idea.location}
                </span>
              )}
              {idea.checklist && idea.checklist.length > 0 && (
                <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                  <ListChecks className="w-3 h-3" />
                  {idea.checklist.filter((c) => c.checked).length}/{idea.checklist.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {hasDetails && (
              <button onClick={onToggleExpand} className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-amber-600 hover:bg-amber-100 transition-colors">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            <button onClick={onEdit} className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-blue-400 hover:bg-blue-50 transition-colors">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={onToggleDone} className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-green-500 hover:bg-green-50 transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg bg-amber-50 text-amber-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-amber-100"
          >
            <div className="p-4 pt-3 space-y-2.5 bg-amber-50/30">
              {idea.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-amber-700/60">{idea.location}</p>
                    {idea.mapsLink && (
                      <a
                        href={idea.mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-500 hover:text-amber-600 flex items-center gap-0.5 mt-0.5"
                      >
                        Open in Maps <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {idea.notes && (
                <div>
                  <p className="text-[10px] text-amber-500/50 font-medium mb-0.5">Notes</p>
                  <p className="text-xs text-amber-700/60 whitespace-pre-wrap">{idea.notes}</p>
                </div>
              )}
              {idea.itinerary && (
                <div>
                  <p className="text-[10px] text-amber-500/50 font-medium mb-0.5">Itinerary</p>
                  <p className="text-xs text-amber-700/60 whitespace-pre-wrap">{idea.itinerary}</p>
                </div>
              )}
              {idea.reminderNote && (
                <div>
                  <p className="text-[10px] text-amber-500/50 font-medium mb-0.5">Reminder</p>
                  <p className="text-xs text-amber-700/60">{idea.reminderNote}</p>
                </div>
              )}
              {idea.checklist && idea.checklist.length > 0 && (
                <div>
                  <p className="text-[10px] text-amber-500/50 font-medium mb-1">Checklist</p>
                  <div className="space-y-1">
                    {idea.checklist.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onToggleChecklist(item.id)}
                        className="flex items-center gap-2 w-full text-left group"
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0',
                            item.checked
                              ? 'bg-green-100 border-green-300 text-green-500'
                              : 'border-amber-200 group-hover:border-green-300'
                          )}
                        >
                          {item.checked && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <span
                          className={cn(
                            'text-xs transition-colors',
                            item.checked ? 'text-amber-400 line-through' : 'text-amber-700/60'
                          )}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- Add / Edit Modal ---- */
function DateFormModal({
  existingDate, onClose, onAdd, onUpdate,
}: {
  existingDate?: DateIdea;
  onClose: () => void;
  onAdd: (idea: Omit<DateIdea, 'id' | 'createdAt' | 'done'>) => void;
  onUpdate: (id: string, updates: Partial<DateIdea>) => void;
}) {
  const isEdit = !!existingDate;
  const [title, setTitle] = useState(existingDate?.title || '');
  const [description, setDescription] = useState(existingDate?.description || '');
  const [category, setCategory] = useState<DateCategory>(existingDate?.category || 'cozy');
  const [emoji, setEmoji] = useState(existingDate?.emoji || '🦆');
  const [scheduledFor, setScheduledFor] = useState(existingDate?.scheduledFor?.split('T')[0] || '');
  const [scheduledTime, setScheduledTime] = useState(
    existingDate?.scheduledFor ? existingDate.scheduledFor.split('T')[1]?.substring(0, 5) || '' : ''
  );
  const [location, setLocation] = useState(existingDate?.location || '');
  const [mapsLink, setMapsLink] = useState(existingDate?.mapsLink || '');
  const [notes, setNotes] = useState(existingDate?.notes || '');
  const [itinerary, setItinerary] = useState(existingDate?.itinerary || '');
  const [reminderNote, setReminderNote] = useState(existingDate?.reminderNote || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existingDate?.checklist || []);
  const [newCheckItem, setNewCheckItem] = useState('');

  const addCheckItem = () => {
    const trimmed = newCheckItem.trim();
    if (!trimmed) return;
    setChecklist((prev) => [...prev, { id: uuidv4(), text: trimmed, checked: false }]);
    setNewCheckItem('');
  };

  const removeCheckItem = (id: string) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let scheduled: string | undefined;
    if (scheduledFor) {
      const time = scheduledTime || '00:00';
      scheduled = new Date(`${scheduledFor}T${time}`).toISOString();
    }

    const dateData = {
      title: title.trim(),
      description: description.trim(),
      category,
      emoji,
      scheduledFor: scheduled,
      location: location.trim() || undefined,
      mapsLink: mapsLink.trim() || undefined,
      notes: notes.trim() || undefined,
      itinerary: itinerary.trim() || undefined,
      reminderNote: reminderNote.trim() || undefined,
      checklist: checklist.length > 0 ? checklist : undefined,
    };

    if (isEdit && existingDate) {
      onUpdate(existingDate.id, dateData);
    } else {
      onAdd(dateData);
    }
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
        className="duck-card p-5 w-full max-w-md space-y-3 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-amber-800">{isEdit ? 'Edit Date' : 'New Date Idea'}</h2>
          <button type="button" onClick={onClose} className="text-amber-400 hover:text-amber-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-12 text-center text-xl duck-input p-2"
              maxLength={4}
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Date title"
              className="flex-1 duck-input"
              autoFocus
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the plan?"
            rows={2}
            className="w-full duck-input resize-none"
          />

          <div className="flex gap-2 flex-wrap">
            {(Object.entries(DATE_CATEGORY_CONFIG) as [DateCategory, (typeof DATE_CATEGORY_CONFIG)[DateCategory]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full font-medium transition-all',
                    category === key ? `${cfg.color} shadow-sm` : 'bg-amber-50 text-amber-500'
                  )}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              )
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-amber-500/50 mb-0.5 block">Date</label>
              <input type="date" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="w-full duck-input" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-amber-500/50 mb-0.5 block">Time</label>
              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full duck-input" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-amber-500/50 mb-0.5 block">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where is this happening?" className="w-full duck-input" />
          </div>
          <div>
            <label className="text-[10px] text-amber-500/50 mb-0.5 block">Google Maps link</label>
            <input value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className="w-full duck-input" />
          </div>

          <div>
            <label className="text-[10px] text-amber-500/50 mb-0.5 block">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra thoughts..." rows={2} className="w-full duck-input resize-none" />
          </div>

          <div>
            <label className="text-[10px] text-amber-500/50 mb-0.5 block">Itinerary (optional)</label>
            <textarea value={itinerary} onChange={(e) => setItinerary(e.target.value)} placeholder="Step by step plan..." rows={2} className="w-full duck-input resize-none" />
          </div>

          <div>
            <label className="text-[10px] text-amber-500/50 mb-0.5 block">Reminder / prep notes</label>
            <input value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} placeholder="What to prepare beforehand..." className="w-full duck-input" />
          </div>

          <div>
            <label className="text-[10px] text-amber-500/50 mb-1 block">Checklist</label>
            {checklist.length > 0 && (
              <div className="space-y-1 mb-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <ListChecks className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-amber-700/60 flex-1">{item.text}</span>
                    <button type="button" onClick={() => removeCheckItem(item.id)} className="text-amber-300 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCheckItem(); } }}
                placeholder="Add item..."
                className="flex-1 duck-input text-xs"
              />
              <button type="button" onClick={addCheckItem} className="text-xs bg-amber-100 text-amber-600 px-3 py-1.5 rounded-xl hover:bg-amber-200 transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full duck-btn py-2.5 text-sm">
          {isEdit ? 'Save changes 🐥' : 'Add date idea 🐥'}
        </button>
      </motion.form>
    </motion.div>
  );
}

/* ---- Memory Capture Modal ---- */
function MemoryCaptureModal({
  date, onClose, onComplete,
}: {
  date: DateIdea;
  onClose: () => void;
  onComplete: (imageUrl: string, caption: string) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    onComplete(imageUrl, caption.trim());
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
        className="duck-card p-6 w-full max-w-md space-y-4"
      >
        <div className="text-center space-y-2">
          <p className="text-3xl">{date.emoji}</p>
          <h2 className="font-semibold text-amber-800">{date.title}</h2>
          <p className="text-xs text-amber-500/50">Upload a picture to capture this memory 🐥</p>
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center gap-2 hover:bg-amber-50 transition-colors overflow-hidden"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-amber-500 font-medium">Tap to upload a photo</p>
              <p className="text-[10px] text-amber-400">Max 5MB</p>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption (optional)"
          className="w-full duck-input"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-amber-100 text-amber-600 py-3 rounded-2xl text-sm font-medium hover:bg-amber-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!imageUrl}
            className="flex-1 duck-btn py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save memory 🦆
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}