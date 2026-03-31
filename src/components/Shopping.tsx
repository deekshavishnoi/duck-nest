'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { ShoppingTab, ShoppingCategory, ShoppingList } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus, Trash2, Check, X, Pencil,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const TAB_KEYS: ShoppingTab[] = ['user1', 'user2', 'together'];
const TAB_EMOJI: Record<ShoppingTab, string> = { user1: '🐥', user2: '🐤', together: '🦆' };

const CATEGORIES: { key: ShoppingCategory; label: string; emoji: string }[] = [
  { key: 'grocery', label: 'Grocery', emoji: '🥑' },
  { key: 'other', label: 'Other Shopping', emoji: '🛍️' },
];

export default function Shopping() {
  const {
    data, canEditTab, getTabLabel, addShoppingList, updateShoppingList, deleteShoppingList,
    addShoppingItem, toggleShoppingItem, updateShoppingItem, removeShoppingItem, partner,
  } = useApp();
  const [activeTab, setActiveTab] = useState<ShoppingTab>('together');
  const [showAdd, setShowAdd] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);

  const lists = data.shopping.filter((l) => l.tab === activeTab);
  const editable = canEditTab(activeTab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Shopping</h1>
          <p className="text-sm text-blue-600/40">{partner ? 'lists & groceries for two' : 'your shopping lists'}</p>
        </div>
        {editable && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="duck-btn-soft flex items-center gap-1.5 text-xs px-3 py-2 rounded-full font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            New list
          </motion.button>
        )}
      </div>

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

      {/* Lists */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {lists.map((list, i) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              index={i}
              editable={editable}
              isEditing={editingListId === list.id}
              onStartEdit={() => setEditingListId(list.id)}
              onStopEdit={() => setEditingListId(null)}
              onDelete={() => deleteShoppingList(list.id)}
              onUpdateList={(updates) => updateShoppingList(list.id, updates)}
              onAddItem={(name) => addShoppingItem(list.id, name)}
              onToggleItem={(itemId) => toggleShoppingItem(list.id, itemId)}
              onUpdateItem={(itemId, name) => updateShoppingItem(list.id, itemId, name)}
              onRemoveItem={(itemId) => removeShoppingItem(list.id, itemId)}
            />
          ))}
        </AnimatePresence>
      </div>

      {lists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🛒</p>
          <p className="text-sm text-blue-600/40">No lists yet. Create one!</p>
        </div>
      )}

      {/* Add List Modal */}
      <AnimatePresence>
        {showAdd && (
          <AddListModal
            tab={activeTab}
            onClose={() => setShowAdd(false)}
            onAdd={addShoppingList}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ShoppingListCard({
  list, index, editable, isEditing, onStartEdit, onStopEdit,
  onDelete, onUpdateList, onAddItem, onToggleItem, onUpdateItem, onRemoveItem,
}: {
  list: ShoppingList;
  index: number;
  editable: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onDelete: () => void;
  onUpdateList: (updates: Partial<ShoppingList>) => void;
  onAddItem: (name: string) => void;
  onToggleItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, name: string) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editTitle, setEditTitle] = useState(list.title);
  const [editCategory, setEditCategory] = useState(list.category);

  const checkedCount = list.items.filter((i) => i.checked).length;

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onAddItem(trimmed);
    setNewItem('');
  };

  const handleSaveEdit = () => {
    onUpdateList({ title: editTitle.trim() || list.title, category: editCategory });
    onStopEdit();
  };

  const handleSaveItemText = (itemId: string) => {
    if (editText.trim()) onUpdateItem(itemId, editText.trim());
    setEditingItemId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="duck-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex-1 space-y-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full duck-input"
              />
              <div className="flex gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setEditCategory(c.key)}
                    className={cn(
                      'text-[10px] px-2.5 py-1 rounded-full font-medium transition-all',
                      editCategory === c.key ? 'bg-blue-200 text-slate-600' : 'bg-blue-50 text-blue-500'
                    )}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="text-xs duck-btn px-3 py-1">Save</button>
                <button onClick={onStopEdit} className="text-xs bg-blue-100 text-blue-500 px-3 py-1 rounded-lg">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg">{list.category === 'grocery' ? '🥑' : '🛍️'}</span>
                <div>
                  <h3 className="font-semibold text-sm text-slate-700">{list.title}</h3>
                  <p className="text-[10px] text-slate-400">
                    {checkedCount}/{list.items.length} items done
                  </p>
                </div>
              </div>
              {editable && (
                <div className="flex gap-1">
                  <button onClick={onStartEdit} className="p-1.5 rounded-lg bg-blue-50 text-slate-300 hover:text-blue-400 hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setConfirmDelete(true)} className="p-1.5 rounded-lg bg-blue-50 text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <ConfirmDialog
                open={confirmDelete}
                title="Delete this list?"
                message={`"${list.title}" and all its items will be removed.`}
                onConfirm={() => { setConfirmDelete(false); onDelete(); }}
                onCancel={() => setConfirmDelete(false)}
              />
            </>
          )}
        </div>

        {/* Progress bar */}
        {list.items.length > 0 && !isEditing && (
          <div className="w-full h-1 bg-blue-100 rounded-full mt-2 overflow-hidden">
            <motion.div
              className="h-full bg-green-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(checkedCount / list.items.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* Items */}
      {!isEditing && (
        <div className="px-4 pb-3">
          <div className="space-y-1">
            {list.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => editable && onToggleItem(item.id)}
                  disabled={!editable}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0',
                    item.checked
                      ? 'bg-green-100 border-green-300 text-green-500'
                      : 'border-blue-200 hover:border-green-300',
                    !editable && 'opacity-60 cursor-default'
                  )}
                >
                  {item.checked && <Check className="w-3 h-3" />}
                </button>

                {editingItemId === item.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => handleSaveItemText(item.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveItemText(item.id)}
                    className="flex-1 duck-input text-xs"
                    autoFocus
                  />
                ) : (
                  <span
                    onDoubleClick={() => { setEditingItemId(item.id); setEditText(item.name); }}
                    className={cn(
                      'flex-1 text-xs cursor-default transition-colors',
                      item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                    )}
                  >
                    {item.name}
                  </span>
                )}

                {editable && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-red-400 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add item */}
          {editable && (
            <div className="flex gap-2 mt-2">
              <input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Add item..."
                className="flex-1 duck-input text-xs"
              />
              <button
                onClick={handleAddItem}
                className="text-xs bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl hover:bg-blue-200 transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function AddListModal({
  tab, onClose, onAdd,
}: {
  tab: ShoppingTab;
  onClose: () => void;
  onAdd: (list: { title: string; category: ShoppingCategory; tab: ShoppingTab }) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>('grocery');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), category, tab });
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
        className="duck-card p-6 w-full max-w-md space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">New Shopping List</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-blue-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List name"
          className="w-full duck-input"
          autoFocus
        />

        <div>
          <p className="text-xs text-blue-500/50 mb-2">Category</p>
          <div className="flex gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={cn(
                  'text-xs px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1',
                  category === c.key ? 'bg-blue-200 text-slate-600' : 'bg-blue-50 text-blue-500'
                )}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full duck-btn py-3 text-sm">
          Create list 🛒
        </button>
      </motion.form>
    </motion.div>
  );
}