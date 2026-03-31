'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/hooks/useAppData';
import { MOOD_CONFIG, Mood, PersonMoodEntry } from '@/types';
import CountdownTimer from './CountdownTimer';
import { Heart, Sparkles, Settings, X, MessageCircleHeart } from 'lucide-react';
import { cn, randomBetween } from '@/lib/utils';
import { DuckCouple, DuckWithHeart, DuckFootprints, SparkleStars, DuckDivider } from '@/components/ui/DuckDoodles';

const LOW_MOOD_MESSAGES = [
  "They might not be feeling their best today. A little extra love goes a long way 💛",
  "Looks like they could use a warm hug. Why not check in? 🤗",
  "A little extra love might be needed today 🐥",
  "They're not feeling so great right now. Maybe send a sweet message? 💌",
];

function getVibeLabel(mood1: Mood, mood2: Mood): { label: string; emoji: string; color: string } {
  const cfg1 = MOOD_CONFIG[mood1];
  const cfg2 = MOOD_CONFIG[mood2];
  if (cfg1.low && cfg2.low) return { label: 'Stormy skies — be extra gentle', emoji: '🌧️', color: 'text-slate-500' };
  if (cfg1.low || cfg2.low) return { label: 'One duck needs extra warmth today', emoji: '☁️', color: 'text-blue-400' };
  if (mood1 === mood2) return { label: 'Perfectly in sync!', emoji: '✨', color: 'text-blue-600' };
  if ((mood1 === 'extra-loving' || mood1 === 'head-over-heels') && (mood2 === 'extra-loving' || mood2 === 'head-over-heels'))
    return { label: 'Overwhelmingly cute together', emoji: '💛', color: 'text-blue-500' };
  return { label: 'Good vibes together', emoji: '🌻', color: 'text-blue-500' };
}

export default function LoveMeter() {
  const { data, currentUser, partner, updateMyMood, setLoveLevel, updateCouple, myDisplayName, partnerDisplayName } = useApp();
  const { loveMeter, couple } = data;
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const myMood = currentUser?.role === 'primary' ? loveMeter.person1Mood : loveMeter.person2Mood;
  const theirMood = currentUser?.role === 'primary' ? loveMeter.person2Mood : loveMeter.person1Mood;
  const myConfig = MOOD_CONFIG[myMood.mood];

  const nestTitle = partner
    ? `${myDisplayName} & ${partnerDisplayName}'s Nest`
    : `${myDisplayName ? `${myDisplayName}'s Nest` : 'Your Cozy Nest'}`;

  const boostLove = () => {
    const boost = randomBetween(1, 10);
    setLoveLevel(Math.min(100, loveMeter.level + boost));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="flex justify-center mb-2">
          {partner ? <DuckCouple size={40} className="opacity-60" /> : <DuckWithHeart size={36} className="opacity-60" />}
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-slate-800"
        >
          {nestTitle}
        </motion.h1>
        <p className="text-xs text-amber-600/40 italic">your cozy little world 🦆</p>
        <DuckFootprints className="opacity-40 mx-auto max-w-[200px]" />
        <button
          onClick={() => setShowSettings(true)}
          className="text-slate-400/40 hover:text-amber-600 transition-colors inline-flex items-center gap-1 text-[10px] mt-1"
        >
          <Settings className="w-3 h-3" /> settings
        </button>
      </div>

      {/* Caring Alert — only when partner exists */}
      {partner && (() => {
        const theirConfig = MOOD_CONFIG[theirMood.mood];
        const theirLow = theirConfig.low;
        const alertMsg = theirLow ? LOW_MOOD_MESSAGES[Math.floor(Date.now() / 86400000) % LOW_MOOD_MESSAGES.length] : null;
        return (
          <AnimatePresence>
            {alertMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="duck-card-warm p-4 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircleHeart className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-slate-700/70 leading-relaxed pt-1">{alertMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })()}

      {/* Mood Sync */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="duck-card p-5"
      >
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
          <span className="text-base">🐥</span>
          {partner ? 'Mood Sync' : 'Your Mood'}
        </h2>

        <div className="flex items-center justify-center gap-4 mb-4">
          {/* My mood */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowMoodPicker(true)}
            className="text-center p-3 rounded-2xl border-2 border-blue-200 bg-blue-50/50 cursor-pointer min-w-[110px] transition-all hover:border-blue-300"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden mb-1.5">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="You" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{myConfig.emoji}</span>
              )}
            </div>
            <p className="text-xs text-slate-700 font-semibold">{myDisplayName || 'You'}</p>
            <p className="text-[10px] text-blue-600/50">{myConfig.emoji} {myConfig.label}</p>
            {myMood.feeling && (
              <p className="text-[10px] text-slate-400 mt-1 italic truncate max-w-[100px]">&ldquo;{myMood.feeling}&rdquo;</p>
            )}
          </motion.button>

          {partner ? (
            <>
              {/* Vibe indicator */}
              {(() => {
                const vibe = getVibeLabel(myMood.mood, theirMood.mood);
                const theirConfig = MOOD_CONFIG[theirMood.mood];
                return (
                  <>
                    <div className="text-center flex-shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-2xl mb-1"
                      >
                        🦆
                      </motion.div>
                      <p className={cn('text-[10px] font-medium max-w-[80px] leading-tight', vibe.color)}>
                        {vibe.emoji} {vibe.label}
                      </p>
                    </div>

                    {/* Partner mood */}
                    <div className="text-center p-3 rounded-2xl min-w-[110px]">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden mb-1.5">
                        {partner.avatarUrl ? (
                          <img src={partner.avatarUrl} alt="Partner" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{theirConfig.emoji}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-semibold">{partnerDisplayName}</p>
                      <p className="text-[10px] text-blue-600/50">{theirConfig.emoji} {theirConfig.label}</p>
                      {theirMood.feeling && (
                        <p className="text-[10px] text-slate-400 mt-1 italic truncate max-w-[100px]">&ldquo;{theirMood.feeling}&rdquo;</p>
                      )}
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            /* Solo — partner not joined yet */
            <div className="text-center p-3 rounded-2xl border-2 border-dashed border-blue-200 min-w-[110px]">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-1.5">
                <span className="text-2xl">🐤</span>
              </div>
              <p className="text-xs text-blue-600/50 font-medium">Partner</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Not here yet</p>
              <p className="text-[10px] text-slate-400/60 mt-1">Invite from profile!</p>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-400/50 mb-1">Tap your profile to update your mood</p>
      </motion.div>

      {/* Mood Update Panel */}
      <AnimatePresence>
        {showMoodPicker && (
          <MoodUpdatePanel
            person={myDisplayName || 'You'}
            entry={myMood}
            onUpdate={updateMyMood}
            onClose={() => setShowMoodPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Love Level */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="duck-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Love Level
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={boostLove}
            className="duck-btn-soft flex items-center gap-1 text-xs px-3 py-1.5"
          >
            <Heart className="w-3 h-3" fill="currentColor" />
            Boost
          </motion.button>
        </div>

        <div className="text-center mb-3">
          <motion.span
            key={loveMeter.level}
            initial={{ scale: 1.3, color: '#d97706' }}
            animate={{ scale: 1, color: '#44381f' }}
            className="text-4xl font-bold"
          >
            {loveMeter.level}%
          </motion.span>
        </div>
        <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #fde68a, #f59e0b, #d97706)' }}
            initial={{ width: 0 }}
            animate={{ width: `${loveMeter.level}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400/50 mt-1 px-1">
          <span>just vibin&apos;</span>
          <span>inseparable</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={loveMeter.level}
          onChange={(e) => setLoveLevel(Number(e.target.value))}
          className="w-full mt-3"
        />
      </motion.div>

      {/* Countdown */}
      <CountdownTimer />

      {/* Decorative divider */}
      <DuckDivider />

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-3"
      >
        <SparkleStars className="mx-auto max-w-[160px] mb-2" />
        <p className="text-xs text-slate-400/40 italic">
          &ldquo;Two little ducks, waddling through life together.&rdquo; 🦆🦆
        </p>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            couple={couple}
            onSave={updateCouple}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Mood Update Panel ---- */
function MoodUpdatePanel({
  person, entry, onUpdate, onClose,
}: {
  person: string;
  entry: PersonMoodEntry;
  onUpdate: (e: Partial<PersonMoodEntry>) => void;
  onClose: () => void;
}) {
  const [mood, setMood] = useState<Mood>(entry.mood);
  const [feeling, setFeeling] = useState(entry.feeling);
  const [note, setNote] = useState(entry.note);
  const moods = Object.entries(MOOD_CONFIG) as [Mood, (typeof MOOD_CONFIG)[Mood]][];

  const handleSave = () => {
    onUpdate({ mood, feeling, note });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="duck-card-warm p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          How are you feeling, {person}?
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-blue-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-blue-600/50 mb-2">Pick your mood</p>
          <div className="flex flex-wrap gap-1.5">
            {moods.map(([key, config]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMood(key)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                  mood === key
                    ? `${config.color} border-current shadow-sm`
                    : 'bg-white/60 text-blue-600/40 border-blue-100 hover:bg-white'
                )}
              >
                <span className="text-sm">{config.emoji}</span>
                {config.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-blue-600/50 mb-1">How are you feeling today?</p>
          <input
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="In a few words..."
            className="duck-input w-full"
          />
        </div>

        <div>
          <p className="text-xs text-blue-600/50 mb-1">Leave a little note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A message for your person..."
            rows={2}
            className="duck-input w-full resize-none"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full duck-btn py-2.5 text-sm"
        >
          Save mood 🐥
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ---- Settings Modal ---- */
function SettingsModal({
  couple, onSave, onClose,
}: {
  couple: { person1: string; person2: string; anniversary: string };
  onSave: (config: Partial<{ person1: string; person2: string; anniversary: string }>) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(couple.anniversary.split('T')[0]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ anniversary: new Date(date).toISOString() });
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
        onSubmit={handleSave}
        className="duck-card p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" /> Nest Settings
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-blue-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs text-blue-600/50 mb-1 block">Anniversary / start date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="duck-input w-full"
          />
        </div>

        <button type="submit" className="w-full duck-btn py-2.5 text-sm">
          Save changes
        </button>
      </motion.form>
    </motion.div>
  );
}