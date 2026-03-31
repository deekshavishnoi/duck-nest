export type Mood =
  | 'happy'
  | 'head-over-heels'
  | 'annoyed'
  | 'missing-you'
  | 'lazy'
  | 'extra-loving'
  | 'having-a-moment'
  | 'sad'
  | 'anxious'
  | 'grateful'
  | 'excited';

export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string; low?: boolean }> = {
  happy: { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-700' },
  'head-over-heels': { emoji: '😍', label: 'Head over heels', color: 'bg-rose-100 text-rose-700' },
  annoyed: { emoji: '😤', label: 'A bit annoyed', color: 'bg-orange-100 text-orange-700', low: true },
  'missing-you': { emoji: '🥺', label: 'Missing you', color: 'bg-blue-100 text-blue-700' },
  lazy: { emoji: '😴', label: 'Lazy mode', color: 'bg-purple-100 text-purple-700' },
  'extra-loving': { emoji: '🥰', label: 'Extra loving', color: 'bg-amber-100 text-amber-700' },
  'having-a-moment': { emoji: '😭', label: 'Having a moment', color: 'bg-indigo-100 text-indigo-700', low: true },
  sad: { emoji: '😢', label: 'Feeling sad', color: 'bg-slate-100 text-slate-700', low: true },
  anxious: { emoji: '😰', label: 'Anxious', color: 'bg-teal-100 text-teal-700', low: true },
  grateful: { emoji: '🙏', label: 'Grateful', color: 'bg-emerald-100 text-emerald-700' },
  excited: { emoji: '🤩', label: 'Excited', color: 'bg-amber-100 text-amber-700' },
};

// ----- Users & Auth -----

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  birthDate?: string;
  displayName?: string;
  partnerNickname?: string;
  usePartnerNickname?: boolean; // default true — show the name your partner gave you
  role: 'primary' | 'partner';
  joinedAt: string;
}

export type UserId = string;

// ----- Mood -----

export interface PersonMoodEntry {
  mood: Mood;
  feeling: string;
  note: string;
  updatedAt: string;
}

// ----- Dates -----

export type DateCategory = 'cozy' | 'adventure' | 'low-energy' | 'special';

export const DATE_CATEGORY_CONFIG: Record<DateCategory, { emoji: string; label: string; color: string }> = {
  cozy: { emoji: '🛋️', label: 'Cozy', color: 'bg-amber-100 text-amber-700' },
  adventure: { emoji: '🏔️', label: 'Adventure', color: 'bg-green-100 text-green-700' },
  'low-energy': { emoji: '☕', label: 'Low-energy', color: 'bg-stone-100 text-stone-700' },
  special: { emoji: '✨', label: 'Special', color: 'bg-violet-100 text-violet-700' },
};

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface DateIdea {
  id: string;
  title: string;
  description: string;
  category: DateCategory;
  emoji: string;
  done: boolean;
  scheduledFor?: string;
  location?: string;
  mapsLink?: string;
  notes?: string;
  itinerary?: string;
  checklist?: ChecklistItem[];
  reminderNote?: string;
  createdAt: string;
  completedAt?: string;
}

// ----- Memories -----

export interface Memory {
  id: string;
  dateId: string;
  title: string;
  caption: string;
  imageUrl: string;
  completedAt: string;
  createdAt: string;
}

// ----- Shopping -----

export type ShoppingCategory = 'grocery' | 'other';
export type ShoppingTab = 'user1' | 'user2' | 'together';

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  title: string;
  category: ShoppingCategory;
  tab: ShoppingTab;
  items: ShoppingItem[];
  createdAt: string;
}

// ----- Chores -----

export type ChoreTab = 'user1' | 'user2' | 'together';
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; points: number; color: string }> = {
  easy: { label: 'Easy', emoji: '🌱', points: 0.5, color: 'bg-green-100 text-green-600' },
  medium: { label: 'Medium', emoji: '⚡', points: 1, color: 'bg-amber-100 text-amber-600' },
  hard: { label: 'Hard', emoji: '🔥', points: 2, color: 'bg-red-100 text-red-600' },
};

export interface SubTask {
  id: string;
  text: string;
  checked: boolean;
}

export interface Chore {
  id: string;
  title: string;
  tab: ChoreTab;
  difficulty: Difficulty;
  deadline?: string;
  subtasks: SubTask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

// ----- Reading List -----

export type ReadingStatus = 'want-to-read' | 'reading' | 'finished';
export type ReadingTab = 'user1' | 'user2';

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  status: ReadingStatus;
  notes?: string;
  tab: ReadingTab;
  createdAt: string;
}

export const READING_STATUS_CONFIG: Record<ReadingStatus, { label: string; emoji: string; color: string }> = {
  'want-to-read': { label: 'Want to read', emoji: '📚', color: 'bg-blue-100 text-blue-700' },
  reading: { label: 'Reading', emoji: '📖', color: 'bg-amber-100 text-amber-700' },
  finished: { label: 'Finished', emoji: '✅', color: 'bg-green-100 text-green-700' },
};

// ----- Watch List -----

export type WatchType = 'movie' | 'series' | 'documentary';
export type WatchStatus = 'want-to-watch' | 'watching' | 'watched';

export interface WatchItem {
  id: string;
  title: string;
  type: WatchType;
  status: WatchStatus;
  notes?: string;
  createdAt: string;
}

export const WATCH_TYPE_CONFIG: Record<WatchType, { label: string; emoji: string }> = {
  movie: { label: 'Movie', emoji: '🎬' },
  series: { label: 'Series', emoji: '📺' },
  documentary: { label: 'Documentary', emoji: '🎞️' },
};

export const WATCH_STATUS_CONFIG: Record<WatchStatus, { label: string; emoji: string; color: string }> = {
  'want-to-watch': { label: 'Want to watch', emoji: '🍿', color: 'bg-purple-100 text-purple-700' },
  watching: { label: 'Watching', emoji: '👀', color: 'bg-amber-100 text-amber-700' },
  watched: { label: 'Watched', emoji: '✅', color: 'bg-green-100 text-green-700' },
};

// ----- Invite -----

export interface InviteState {
  code: string | null;
  partnerJoined: boolean;
}

// ----- Couple Config -----

export interface CoupleConfig {
  person1: string;
  person2: string;
  anniversary: string;
}

export interface LoveMeterState {
  level: number;
  person1Mood: PersonMoodEntry;
  person2Mood: PersonMoodEntry;
}

export interface Scores {
  user1: number;
  user2: number;
  together: number;
}

// ----- App Data (one shared space) -----

export interface AppData {
  currentUserId: string | null;
  users: UserProfile[];
  onboardingComplete: boolean;
  couple: CoupleConfig;
  invite: InviteState;
  loveMeter: LoveMeterState;
  dates: DateIdea[];
  memories: Memory[];
  shopping: ShoppingList[];
  chores: Chore[];
  reading: ReadingItem[];
  watchList: WatchItem[];
  scores: Scores;
}