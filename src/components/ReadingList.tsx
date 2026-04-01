'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { ReadingTab, ReadingStatus, ReadingItem, READING_STATUS_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X, Pencil, Check } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DuckSleeping } from '@/components/ui/DuckDoodles';
import { StarRating, ReadingProgressBar } from '@/components/ui/Charts';
import { ReadingStatsPanel, StatsToggle, StatsDropdown } from '@/components/Statistics';

const TAB_KEYS: ReadingTab[] = ['user1', 'user2'];
const TAB_EMOJI: Record<ReadingTab, string> = { user1: '🐥', user2: '🐤' };
const STATUS_KEYS: ReadingStatus[] = ['want-to-read', 'reading', 'finished'];

export default function ReadingList() {
  const {
    data, canEditTab, getTabLabel, addReadingItem, updateReadingItem, deleteReadingItem,
    updateReadingProgress, rateItem, getMyRating, getPartnerRating, partner,
  } = useApp();
  const [activeTab, setActiveTab] = useState<ReadingTab>('user1');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [addError, setAddError] = useState('');

  const allItems = data.reading ?? [];
  const items = allItems.filter((r) => r.tab === activeTab);
  const editable = canEditTab(activeTab);

  const grouped: Record<ReadingStatus, ReadingItem[]> = {
    'want-to-read': items.filter((i) => i.status === 'want-to-read'),
    reading: items.filter((i) => i.status === 'reading'),
    finished: items.filter((i) => i.status === 'finished'),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reading List</h1>
          <p className="text-sm text-amber-600/40">{partner ? 'books & reads for two' : 'your reading corner'}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatsToggle open={showStats} onToggle={() => setShowStats(!showStats)} />
          {editable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="duck-btn-soft flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add book
            </motion.button>
          )}
        </div>
      </div>

      <StatsDropdown open={showStats}>
        <ReadingStatsPanel items={allItems} ratings={data.ratings ?? {}} />
      </StatsDropdown>

      {!editable && (
        <div className="bg-blue-50 rounded-xl px-4 py-2 text-center border border-blue-200">
          <p className="text-[10px] text-blue-600">👀 You&apos;re viewing — only they can edit this list</p>
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
                ? 'bg-white shadow-sm border border-blue-200 text-slate-700'
                : 'bg-transparent text-blue-500/50 hover:bg-white/50'
            )}
          >
            <span>{TAB_EMOJI[key]}</span> {getTabLabel(key)}
          </button>
        ))}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && editable && (
          <AddBookForm
            tab={activeTab}
            onAdd={(item) => {
              try {
                setAddError('');
                addReadingItem(item);
                setShowAdd(false);
              } catch (e) {
                console.error('Failed to add book:', e);
                setAddError('Failed to add book. Please try again.');
              }
            }}
            onCancel={() => { setShowAdd(false); setAddError(''); }}
            error={addError}
          />
        )}
      </AnimatePresence>

      {/* Books grouped by status */}
      {items.length === 0 && !showAdd ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="duck-card text-center py-12"
        >
          <DuckSleeping className="mx-auto mb-3 text-amber-400/60" size={56} />
          <p className="text-sm text-amber-600/40">No books yet — add your first read!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {STATUS_KEYS.map((status) => {
            const books = grouped[status];
            if (books.length === 0) return null;
            const cfg = READING_STATUS_CONFIG[status];
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-sm">{cfg.emoji}</span>
                  <h3 className="text-xs font-semibold text-slate-600/70 uppercase tracking-wide">{cfg.label}</h3>
                  <span className="text-[10px] text-slate-400 ml-auto">{books.length}</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {books.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        editable={editable}
                        isEditing={editingId === book.id}
                        onEdit={() => setEditingId(book.id)}
                        onCancelEdit={() => setEditingId(null)}
                        onUpdate={(updates) => { updateReadingItem(book.id, updates); setEditingId(null); }}
                        onDelete={() => deleteReadingItem(book.id)}
                        onProgressUpdate={(page) => updateReadingProgress(book.id, page)}
                        onRate={(rating, review) => rateItem(book.id, rating, review)}
                        myRating={getMyRating(book.id)}
                        partnerRating={getPartnerRating(book.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- Add Book Form ---- */
function AddBookForm({
  tab,
  onAdd,
  onCancel,
  error,
}: {
  tab: ReadingTab;
  onAdd: (item: { title: string; author: string; status: ReadingStatus; notes?: string; tab: ReadingTab; totalPages?: number }) => void;
  onCancel: () => void;
  error?: string;
}) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('want-to-read');
  const [notes, setNotes] = useState('');
  const [totalPages, setTotalPages] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(), author: author.trim(), status,
      notes: notes.trim() || undefined, tab,
      totalPages: totalPages ? parseInt(totalPages) : undefined,
    });
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
        <h3 className="text-sm font-semibold text-slate-700">Add a book</h3>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-blue-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded-xl">{error}</div>
      )}
      <input
        className="duck-input w-full"
        placeholder="Book title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <input
        className="duck-input w-full"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <input
        className="duck-input w-full"
        placeholder="Total pages (optional)"
        type="number"
        min="1"
        value={totalPages}
        onChange={(e) => setTotalPages(e.target.value)}
      />
      <div className="flex gap-2">
        {STATUS_KEYS.map((s) => {
          const cfg = READING_STATUS_CONFIG[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                status === s ? cfg.color + ' ring-1 ring-current/20' : 'bg-white/50 text-blue-500/50'
              )}
            >
              {cfg.emoji} {cfg.label}
            </button>
          );
        })}
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
        Add book
      </button>
    </motion.form>
  );
}

/* ---- Book Card ---- */
function BookCard({
  book,
  editable,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onProgressUpdate,
  onRate,
  myRating,
  partnerRating,
}: {
  book: ReadingItem;
  editable: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<ReadingItem>) => void;
  onDelete: () => void;
  onProgressUpdate: (page: number) => void;
  onRate: (rating: number, review?: string) => void;
  myRating: { rating: number; review?: string } | null;
  partnerRating: { rating: number; review?: string } | null;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [status, setStatus] = useState(book.status);
  const [notes, setNotes] = useState(book.notes || '');
  const [totalPages, setTotalPages] = useState(String(book.totalPages || ''));
  const [pageInput, setPageInput] = useState(String(book.currentPage || 0));
  const [showReview, setShowReview] = useState(false);
  const [reviewText, setReviewText] = useState(myRating?.review || '');

  if (isEditing) {
    return (
      <motion.div layout className="duck-card space-y-3">
        <input className="duck-input w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="duck-input w-full" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input className="duck-input w-full" placeholder="Total pages" type="number" min="1" value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)} />
        <div className="flex gap-2">
          {STATUS_KEYS.map((s) => {
            const cfg = READING_STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                  status === s ? cfg.color + ' ring-1 ring-current/20' : 'bg-white/50 text-blue-500/50'
                )}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
        <textarea className="duck-input w-full resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={() => onUpdate({
            title: title.trim(), author: author.trim(), status, notes: notes.trim() || undefined,
            totalPages: totalPages ? parseInt(totalPages) : undefined,
          })} className="duck-btn flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1">
            <Check className="w-3 h-3" /> Save
          </button>
          <button onClick={onCancelEdit} className="duck-btn-soft flex-1 py-1.5 rounded-lg text-xs">Cancel</button>
        </div>
      </motion.div>
    );
  }

  const cfg = READING_STATUS_CONFIG[book.status];
  const isReading = book.status === 'reading';
  const isFinished = book.status === 'finished';

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
            <h4 className="text-sm font-semibold text-slate-800 truncate">{book.title}</h4>
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap', cfg.color)}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
          {book.author && <p className="text-xs text-blue-600/60">by {book.author}</p>}
          {book.notes && <p className="text-xs text-slate-600/50 mt-1 line-clamp-2">{book.notes}</p>}
        </div>
        {editable && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <ConfirmDialog
              open={confirmDelete}
              title="Delete book?"
              message={`Remove "${book.title}"? This can't be undone.`}
              confirmLabel="Delete"
              onConfirm={onDelete}
              onCancel={() => setConfirmDelete(false)}
            />
          </div>
        )}
      </div>

      {/* Progress bar for books with totalPages */}
      {(isReading || isFinished) && book.totalPages ? (
        <ReadingProgressBar currentPage={book.currentPage || 0} totalPages={book.totalPages} compact />
      ) : null}

      {/* Progress update input */}
      {isReading && editable && book.totalPages ? (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-blue-600/60">Page:</span>
          <input
            type="number" min="0" max={book.totalPages}
            className="duck-input w-20 text-xs text-center py-1"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => {
              const val = Math.min(Math.max(0, parseInt(pageInput) || 0), book.totalPages || 9999);
              setPageInput(String(val));
              onProgressUpdate(val);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
          <span className="text-[10px] text-blue-500/50">/ {book.totalPages}</span>
        </div>
      ) : null}

      {/* Rating section for finished books */}
      {isFinished && (
        <div className="mt-2 pt-2 border-t border-blue-100 space-y-1.5">
          {editable ? (
            <>
              <StarRating value={myRating?.rating || 0} onChange={(r) => onRate(r, reviewText || undefined)} label="Your rating" />
              {myRating && myRating.rating > 0 && (
                <button onClick={() => setShowReview(!showReview)}
                  className="text-[10px] text-blue-500 hover:text-slate-600 transition-colors">
                  {showReview ? 'Hide review' : (myRating.review ? 'Edit review' : '+ Add review')}
                </button>
              )}
              {showReview && (
                <div className="space-y-1.5">
                  <textarea className="duck-input w-full resize-none text-xs" rows={2} placeholder="Write a short review..."
                    value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                  <button onClick={() => { onRate(myRating?.rating || 0, reviewText.trim() || undefined); setShowReview(false); }}
                    className="duck-btn-soft text-[10px] px-3 py-1 rounded-lg">Save review</button>
                </div>
              )}
            </>
          ) : (
            myRating && <StarRating value={myRating.rating} readonly size="sm" label="Their rating" />
          )}
          {partnerRating && partnerRating.rating > 0 && (
            <div className="mt-1">
              <StarRating value={partnerRating.rating} readonly size="sm" label="Partner" />
              {partnerRating.review && <p className="text-[10px] text-blue-600/50 mt-0.5 italic">&quot;{partnerRating.review}&quot;</p>}
            </div>
          )}
          {myRating?.review && !showReview && editable && (
            <p className="text-[10px] text-blue-600/50 italic">&quot;{myRating.review}&quot;</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
