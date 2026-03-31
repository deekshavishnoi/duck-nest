'use client';

import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  AppData, DateIdea, CoupleConfig,
  PersonMoodEntry, UserProfile, ShoppingList,
  Difficulty, DIFFICULTY_CONFIG, ShoppingTab, ChoreTab,
  ShoppingCategory, ReadingItem, ReadingStatus, ReadingTab,
  WatchItem, WatchType, WatchStatus, ItemRating,
} from '@/types';
import { DEFAULT_APP_DATA, STARTER_DATES } from '@/lib/seed-data';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ----- Permission helpers -----
type TabOwner = 'user1' | 'user2' | 'together';

function canEdit(userRole: 'primary' | 'partner' | null, tab: TabOwner): boolean {
  if (!userRole) return false;
  if (tab === 'together') return true;
  if (tab === 'user1' && userRole === 'primary') return true;
  if (tab === 'user2' && userRole === 'partner') return true;
  return false;
}

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  // Auth
  currentUser: UserProfile | null;
  partner: UserProfile | null;
  isLoggedIn: boolean;
  isOnboardingComplete: boolean;
  signUp: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logIn: (email: string, password: string) => { success: boolean; error?: string };
  logOut: () => void;
  joinWithInvite: (code: string, name: string, email: string, password: string) => { success: boolean; error?: string };
  generateInviteCode: () => string;
  // Display names
  myDisplayName: string;
  partnerDisplayName: string;
  getDisplayName: (userId: string) => string;
  // Permissions
  canEditTab: (tab: TabOwner) => boolean;
  getTabLabel: (tab: TabOwner) => string;
  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePartnerNickname: (nickname: string) => void;
  // Couple
  updateCouple: (config: Partial<CoupleConfig>) => void;
  // Love
  updateMyMood: (entry: Partial<PersonMoodEntry>) => void;
  setLoveLevel: (level: number) => void;
  // Dates
  addDateIdea: (idea: Omit<DateIdea, 'id' | 'createdAt' | 'done'>) => void;
  updateDateIdea: (id: string, updates: Partial<DateIdea>) => void;
  completeDateWithMemory: (dateId: string, imageUrl: string, caption: string) => void;
  undoDateComplete: (dateId: string) => void;
  deleteDateIdea: (id: string) => void;
  toggleChecklistItem: (dateId: string, itemId: string) => void;
  // Memories
  deleteMemory: (id: string) => void;
  // Shopping
  addShoppingList: (list: { title: string; category: ShoppingCategory; tab: ShoppingTab }) => void;
  updateShoppingList: (id: string, updates: Partial<ShoppingList>) => void;
  deleteShoppingList: (id: string) => void;
  addShoppingItem: (listId: string, name: string) => void;
  toggleShoppingItem: (listId: string, itemId: string) => void;
  updateShoppingItem: (listId: string, itemId: string, name: string) => void;
  removeShoppingItem: (listId: string, itemId: string) => void;
  // Chores
  addChore: (chore: { title: string; tab: ChoreTab; difficulty: Difficulty; deadline?: string; subtasks: { text: string }[] }) => void;
  deleteChore: (id: string) => void;
  toggleChoreComplete: (id: string) => void;
  toggleSubTask: (choreId: string, subTaskId: string) => void;
  // Reading
  addReadingItem: (item: { title: string; author: string; status: ReadingStatus; notes?: string; tab: ReadingTab; totalPages?: number }) => void;
  updateReadingItem: (id: string, updates: Partial<ReadingItem>) => void;
  deleteReadingItem: (id: string) => void;
  updateReadingProgress: (id: string, currentPage: number) => void;
  // Watch List
  addWatchItem: (item: { title: string; type: WatchType; status: WatchStatus; notes?: string }) => void;
  updateWatchItem: (id: string, updates: Partial<WatchItem>) => void;
  deleteWatchItem: (id: string) => void;
  // Ratings (per-user)
  rateItem: (itemId: string, rating: number, review?: string) => void;
  getMyRating: (itemId: string) => ItemRating | null;
  getPartnerRating: (itemId: string) => ItemRating | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rawData, setData, isLoaded] = useLocalStorage<AppData>('duckspace-data-v1', DEFAULT_APP_DATA);

  // Merge with defaults so newly added fields are always present
  const data: AppData = useMemo(() => ({ ...DEFAULT_APP_DATA, ...rawData }), [rawData]);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === data.currentUserId) ?? null,
    [data.users, data.currentUserId]
  );

  const partner = useMemo(
    () => data.users.find((u) => u.id !== data.currentUserId) ?? null,
    [data.users, data.currentUserId]
  );

  const isLoggedIn = !!currentUser;
  const isOnboardingComplete = data.onboardingComplete;
  const isLoading = !isLoaded;
  const myRole = currentUser?.role ?? null;

  // ----- Display name resolution -----
  // For user X: if X opts in to partner nickname (default true) AND
  // the other user set a partnerNickname, use that.
  // Otherwise use X's own displayName, falling back to X's name.
  const getDisplayName = (userId: string): string => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return 'Unknown';
    const other = data.users.find((u) => u.id !== userId);
    const useNickname = user.usePartnerNickname !== false; // default true
    if (useNickname && other?.partnerNickname) return other.partnerNickname;
    return user.displayName || user.name;
  };

  const myDisplayName = currentUser ? getDisplayName(currentUser.id) : '';
  const partnerDisplayName = partner ? getDisplayName(partner.id) : '';

  // ----- Auth -----
  const logIn = (email: string, password: string) => {
    const trimEmail = email.trim().toLowerCase();
    const user = data.users.find((u) => u.email === trimEmail);
    if (!user) return { success: false, error: 'No account found with this email' };
    const passwords = JSON.parse(localStorage.getItem('duckspace-passwords') || '{}');
    const stored = passwords[user.id];
    if (!stored) return { success: false, error: 'Incorrect password' };
    // Support both legacy plain-text and new bcrypt hashes
    const isHash = typeof stored === 'string' && stored.startsWith('$2');
    const match = isHash ? bcrypt.compareSync(password, stored) : stored === password;
    if (!match) return { success: false, error: 'Incorrect password' };
    // Migrate legacy plain-text password to hash on successful login
    if (!isHash) {
      passwords[user.id] = bcrypt.hashSync(password, 10);
      localStorage.setItem('duckspace-passwords', JSON.stringify(passwords));
    }
    setData((prev) => ({ ...prev, currentUserId: user.id }));
    return { success: true };
  };

  const logOut = () => {
    setData((prev) => ({ ...prev, currentUserId: null }));
  };

  const signUpInternal = (name: string, email: string, password: string): { success: boolean; error?: string; userId?: string } => {
    const trimEmail = email.trim().toLowerCase();
    const trimName = name.trim();
    if (!trimName) return { success: false, error: 'Name is required' };
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) return { success: false, error: 'Valid email is required' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

    // Check all duckspace password stores for duplicate emails
    const existingUsers = data.users;
    if (existingUsers.some((u) => u.email === trimEmail)) {
      return { success: false, error: 'This email is already registered' };
    }
    if (existingUsers.length >= 2) {
      return { success: false, error: 'This space already has two members' };
    }

    const userId = uuidv4();
    // Hash password with bcrypt before storing
    const hash = bcrypt.hashSync(password, 10);
    const passwords = JSON.parse(localStorage.getItem('duckspace-passwords') || '{}');
    passwords[userId] = hash;
    localStorage.setItem('duckspace-passwords', JSON.stringify(passwords));

    return { success: true, userId };
  };

  const signUpWrapped = (name: string, email: string, password: string) => {
    const result = signUpInternal(name, email, password);
    if (!result.success || !result.userId) return { success: result.success, error: result.error };

    const user: UserProfile = {
      id: result.userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'primary',
      joinedAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      currentUserId: result.userId!,
      users: [user],
      couple: { ...prev.couple, person1: name.trim() },
    }));

    return { success: true };
  };

  const joinWithInvite = (code: string, name: string, email: string, password: string) => {
    if (!data.invite.code || data.invite.code !== code.trim().toUpperCase()) {
      return { success: false, error: 'Invalid invite code' };
    }
    if (data.invite.partnerJoined) {
      return { success: false, error: 'A partner has already joined this space' };
    }
    if (data.users.length >= 2) {
      return { success: false, error: 'This space already has two members' };
    }

    const result = signUpInternal(name, email, password);
    if (!result.success || !result.userId) return { success: result.success, error: result.error };

    const user: UserProfile = {
      id: result.userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'partner',
      joinedAt: new Date().toISOString(),
    };

    // Add starter dates when partner joins
    const now = new Date().toISOString();
    const starterDates = STARTER_DATES.map((d) => ({
      ...d,
      id: uuidv4(),
      done: false,
      createdAt: now,
    }));

    setData((prev) => ({
      ...prev,
      currentUserId: result.userId!,
      users: [...prev.users, user],
      onboardingComplete: true,
      couple: { ...prev.couple, person2: name.trim() },
      invite: { ...prev.invite, partnerJoined: true },
      dates: [...prev.dates, ...starterDates],
    }));

    return { success: true };
  };

  const generateInviteCode = () => {
    const code = uuidv4().slice(0, 8).toUpperCase();
    setData((prev) => ({ ...prev, invite: { ...prev.invite, code } }));
    return code;
  };

  // ----- Permissions -----
  const canEditTab = (tab: TabOwner) => canEdit(myRole, tab);

  const getTabLabel = (tab: TabOwner) => {
    if (tab === 'together') return 'Together';
    if (tab === 'user1') {
      const primary = data.users.find((u) => u.role === 'primary');
      return primary ? getDisplayName(primary.id) : 'You';
    }
    const partnerUser = data.users.find((u) => u.role === 'partner');
    return partnerUser ? getDisplayName(partnerUser.id) : 'Partner';
  };

  // ----- Profile -----
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u)),
      couple: {
        ...prev.couple,
        ...(currentUser.role === 'primary' && updates.name ? { person1: updates.name } : {}),
        ...(currentUser.role === 'partner' && updates.name ? { person2: updates.name } : {}),
      },
    }));
  };

  const updatePartnerNickname = (nickname: string) => {
    if (!currentUser) return;
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, partnerNickname: nickname } : u
      ),
    }));
  };

  // ----- Couple -----
  const updateCouple = (config: Partial<CoupleConfig>) => {
    setData((prev) => ({ ...prev, couple: { ...prev.couple, ...config } }));
  };

  // ----- Mood -----
  const updateMyMood = (entry: Partial<PersonMoodEntry>) => {
    if (!currentUser) return;
    const moodKey = currentUser.role === 'primary' ? 'person1Mood' : 'person2Mood';
    setData((prev) => ({
      ...prev,
      loveMeter: {
        ...prev.loveMeter,
        [moodKey]: { ...prev.loveMeter[moodKey], ...entry, updatedAt: new Date().toISOString() },
      },
    }));
  };

  const setLoveLevel = (level: number) => {
    setData((prev) => ({
      ...prev,
      loveMeter: { ...prev.loveMeter, level: Math.max(0, Math.min(100, level)) },
    }));
  };

  // ----- Dates -----
  const addDateIdea = (idea: Omit<DateIdea, 'id' | 'createdAt' | 'done'>) => {
    setData((prev) => ({
      ...prev,
      dates: [...prev.dates, { ...idea, id: uuidv4(), createdAt: new Date().toISOString(), done: false }],
    }));
  };

  const updateDateIdea = (id: string, updates: Partial<DateIdea>) => {
    setData((prev) => ({
      ...prev,
      dates: prev.dates.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  };

  const completeDateWithMemory = (dateId: string, imageUrl: string, caption: string) => {
    const now = new Date().toISOString();
    setData((prev) => {
      const date = prev.dates.find((d) => d.id === dateId);
      if (!date) return prev;
      return {
        ...prev,
        dates: prev.dates.map((d) => (d.id === dateId ? { ...d, done: true, completedAt: now } : d)),
        memories: [...prev.memories, { id: uuidv4(), dateId, title: date.title, caption, imageUrl, completedAt: now, createdAt: now }],
      };
    });
  };

  const undoDateComplete = (dateId: string) => {
    setData((prev) => ({
      ...prev,
      dates: prev.dates.map((d) => (d.id === dateId ? { ...d, done: false, completedAt: undefined } : d)),
      memories: prev.memories.filter((m) => m.dateId !== dateId),
    }));
  };

  const deleteDateIdea = (id: string) => {
    setData((prev) => ({
      ...prev,
      dates: prev.dates.filter((d) => d.id !== id),
      memories: prev.memories.filter((m) => m.dateId !== id),
    }));
  };

  const toggleChecklistItem = (dateId: string, itemId: string) => {
    setData((prev) => ({
      ...prev,
      dates: prev.dates.map((d) =>
        d.id === dateId
          ? { ...d, checklist: d.checklist?.map((c) => (c.id === itemId ? { ...c, checked: !c.checked } : c)) }
          : d
      ),
    }));
  };

  // ----- Memories -----
  const deleteMemory = (id: string) => {
    setData((prev) => ({ ...prev, memories: prev.memories.filter((m) => m.id !== id) }));
  };

  // ----- Shopping -----
  const addShoppingList = (list: { title: string; category: ShoppingCategory; tab: ShoppingTab }) => {
    if (!canEdit(myRole, list.tab)) return;
    setData((prev) => ({
      ...prev,
      shopping: [...prev.shopping, { ...list, id: uuidv4(), items: [], createdAt: new Date().toISOString() }],
    }));
  };

  const updateShoppingList = (id: string, updates: Partial<ShoppingList>) => {
    setData((prev) => {
      const list = prev.shopping.find((l) => l.id === id);
      if (!list || !canEdit(myRole, list.tab)) return prev;
      return { ...prev, shopping: prev.shopping.map((l) => (l.id === id ? { ...l, ...updates } : l)) };
    });
  };

  const deleteShoppingList = (id: string) => {
    setData((prev) => {
      const list = prev.shopping.find((l) => l.id === id);
      if (!list || !canEdit(myRole, list.tab)) return prev;
      return { ...prev, shopping: prev.shopping.filter((l) => l.id !== id) };
    });
  };

  const addShoppingItem = (listId: string, name: string) => {
    setData((prev) => {
      const list = prev.shopping.find((l) => l.id === listId);
      if (!list || !canEdit(myRole, list.tab)) return prev;
      return {
        ...prev,
        shopping: prev.shopping.map((l) =>
          l.id === listId ? { ...l, items: [...l.items, { id: uuidv4(), name, checked: false }] } : l
        ),
      };
    });
  };

  const toggleShoppingItem = (listId: string, itemId: string) => {
    setData((prev) => {
      const list = prev.shopping.find((l) => l.id === listId);
      if (!list || !canEdit(myRole, list.tab)) return prev;
      return {
        ...prev,
        shopping: prev.shopping.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)) }
            : l
        ),
      };
    });
  };

  const updateShoppingItem = (listId: string, itemId: string, name: string) => {
    setData((prev) => {
      const list = prev.shopping.find((l) => l.id === listId);
      if (!list || !canEdit(myRole, list.tab)) return prev;
      return {
        ...prev,
        shopping: prev.shopping.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, name } : i)) }
            : l
        ),
      };
    });
  };

  const removeShoppingItem = (listId: string, itemId: string) => {
    setData((prev) => {
      const list = prev.shopping.find((l) => l.id === listId);
      if (!list || !canEdit(myRole, list.tab)) return prev;
      return {
        ...prev,
        shopping: prev.shopping.map((l) =>
          l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
        ),
      };
    });
  };

  // ----- Chores -----
  const addChore = (chore: { title: string; tab: ChoreTab; difficulty: Difficulty; deadline?: string; subtasks: { text: string }[] }) => {
    if (!canEdit(myRole, chore.tab)) return;
    setData((prev) => ({
      ...prev,
      chores: [
        ...prev.chores,
        {
          id: uuidv4(),
          title: chore.title,
          tab: chore.tab,
          difficulty: chore.difficulty,
          deadline: chore.deadline,
          subtasks: chore.subtasks.map((s) => ({ id: uuidv4(), text: s.text, checked: false })),
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  };

  const deleteChore = (id: string) => {
    setData((prev) => {
      const chore = prev.chores.find((c) => c.id === id);
      if (!chore || !canEdit(myRole, chore.tab)) return prev;
      return { ...prev, chores: prev.chores.filter((c) => c.id !== id) };
    });
  };

  const toggleChoreComplete = (id: string) => {
    setData((prev) => {
      const chore = prev.chores.find((c) => c.id === id);
      if (!chore || !canEdit(myRole, chore.tab)) return prev;
      const wasCompleted = chore.completed;
      const now = new Date();
      const newScores = { ...prev.scores };
      const points = DIFFICULTY_CONFIG[chore.difficulty].points;
      const scoreKey = chore.tab === 'together' ? 'together' : chore.tab;

      if (!wasCompleted) {
        const onTime = !chore.deadline || new Date(chore.deadline) >= now;
        if (onTime) newScores[scoreKey] += points;
      } else {
        newScores[scoreKey] = Math.max(0, newScores[scoreKey] - points);
      }

      return {
        ...prev,
        scores: newScores,
        chores: prev.chores.map((c) =>
          c.id === id ? { ...c, completed: !wasCompleted, completedAt: !wasCompleted ? now.toISOString() : undefined } : c
        ),
      };
    });
  };

  const toggleSubTask = (choreId: string, subTaskId: string) => {
    setData((prev) => {
      const chore = prev.chores.find((c) => c.id === choreId);
      if (!chore || !canEdit(myRole, chore.tab)) return prev;
      return {
        ...prev,
        chores: prev.chores.map((c) =>
          c.id === choreId
            ? { ...c, subtasks: c.subtasks.map((s) => (s.id === subTaskId ? { ...s, checked: !s.checked } : s)) }
            : c
        ),
      };
    });
  };

  // ----- Reading List -----
  const addReadingItem = (item: { title: string; author: string; status: ReadingStatus; notes?: string; tab: ReadingTab; totalPages?: number }) => {
    if (!canEdit(myRole, item.tab)) return;
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      reading: [...prev.reading, {
        ...item,
        id: uuidv4(),
        currentPage: 0,
        startedAt: item.status === 'reading' ? now : undefined,
        finishedAt: item.status === 'finished' ? now : undefined,
        createdAt: now,
      }],
    }));
  };

  const updateReadingItem = (id: string, updates: Partial<ReadingItem>) => {
    setData((prev) => {
      const item = prev.reading.find((r) => r.id === id);
      if (!item || !canEdit(myRole, item.tab)) return prev;
      const merged = { ...item, ...updates };
      // Auto-set timestamps based on status changes
      if (updates.status === 'reading' && !item.startedAt) merged.startedAt = new Date().toISOString();
      if (updates.status === 'finished' && !item.finishedAt) merged.finishedAt = new Date().toISOString();
      // Auto-complete if currentPage >= totalPages
      if (merged.totalPages && merged.currentPage && merged.currentPage >= merged.totalPages) {
        merged.status = 'finished';
        if (!merged.finishedAt) merged.finishedAt = new Date().toISOString();
      }
      return { ...prev, reading: prev.reading.map((r) => (r.id === id ? merged : r)) };
    });
  };

  const updateReadingProgress = (id: string, currentPage: number) => {
    updateReadingItem(id, { currentPage: Math.max(0, currentPage), status: 'reading' });
  };

  const deleteReadingItem = (id: string) => {
    setData((prev) => {
      const item = prev.reading.find((r) => r.id === id);
      if (!item || !canEdit(myRole, item.tab)) return prev;
      // Also clean up ratings for this item
      const newRatings = { ...prev.ratings };
      Object.keys(newRatings).forEach((key) => {
        if (key.startsWith(id + ':')) delete newRatings[key];
      });
      return { ...prev, reading: prev.reading.filter((r) => r.id !== id), ratings: newRatings };
    });
  };

  // ----- Watch List -----
  const addWatchItem = (item: { title: string; type: WatchType; status: WatchStatus; notes?: string }) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      watchList: [...prev.watchList, {
        ...item,
        id: uuidv4(),
        watchedAt: item.status === 'watched' ? now : undefined,
        createdAt: now,
      }],
    }));
  };

  const updateWatchItem = (id: string, updates: Partial<WatchItem>) => {
    if (!currentUser) return;
    setData((prev) => ({
      ...prev,
      watchList: prev.watchList.map((w) => {
        if (w.id !== id) return w;
        const merged = { ...w, ...updates };
        if (updates.status === 'watched' && !w.watchedAt) merged.watchedAt = new Date().toISOString();
        return merged;
      }),
    }));
  };

  const deleteWatchItem = (id: string) => {
    if (!currentUser) return;
    setData((prev) => {
      const newRatings = { ...prev.ratings };
      Object.keys(newRatings).forEach((key) => {
        if (key.startsWith(id + ':')) delete newRatings[key];
      });
      return { ...prev, watchList: prev.watchList.filter((w) => w.id !== id), ratings: newRatings };
    });
  };

  // ----- Ratings (individual per-user) -----
  const rateItem = useCallback((itemId: string, rating: number, review?: string) => {
    if (!currentUser) return;
    const key = `${itemId}:${currentUser.id}`;
    setData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [key]: { rating: Math.max(0, Math.min(5, rating)), review: review || undefined, ratedAt: new Date().toISOString() },
      },
    }));
  }, [currentUser, setData]);

  const getMyRating = useCallback((itemId: string): ItemRating | null => {
    if (!currentUser) return null;
    return data.ratings?.[`${itemId}:${currentUser.id}`] ?? null;
  }, [currentUser, data.ratings]);

  const getPartnerRating = useCallback((itemId: string): ItemRating | null => {
    if (!partner) return null;
    return data.ratings?.[`${itemId}:${partner.id}`] ?? null;
  }, [partner, data.ratings]);

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        currentUser,
        partner,
        isLoggedIn,
        isOnboardingComplete,
        signUp: signUpWrapped,
        logIn,
        logOut,
        joinWithInvite,
        generateInviteCode,
        myDisplayName,
        partnerDisplayName,
        getDisplayName,
        canEditTab,
        getTabLabel,
        updateProfile,
        updatePartnerNickname,
        updateCouple,
        updateMyMood,
        setLoveLevel,
        addDateIdea, updateDateIdea, completeDateWithMemory, undoDateComplete, deleteDateIdea, toggleChecklistItem,
        deleteMemory,
        addShoppingList, updateShoppingList, deleteShoppingList,
        addShoppingItem, toggleShoppingItem, updateShoppingItem, removeShoppingItem,
        addChore, deleteChore, toggleChoreComplete, toggleSubTask,
        addReadingItem, updateReadingItem, deleteReadingItem, updateReadingProgress,
        addWatchItem, updateWatchItem, deleteWatchItem,
        rateItem, getMyRating, getPartnerRating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}