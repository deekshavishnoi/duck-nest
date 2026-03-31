'use client';

import React, { createContext, useContext, ReactNode, useMemo, useCallback, useState, useEffect } from 'react';
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
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type User as FirebaseUser,
} from '@/lib/firebase';

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
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  partner: UserProfile | null;
  isLoggedIn: boolean;
  isOnboardingComplete: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logOut: () => Promise<void>;
  joinWithInvite: (code: string, name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  joinWithInviteGoogle: (code: string) => Promise<{ success: boolean; error?: string }>;
  generateInviteCode: () => string;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  emailVerified: boolean;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Migrate stored data: ensure all fields from DEFAULT_APP_DATA exist
  // This prevents crashes when setData callbacks spread newly-added arrays (e.g. prev.reading)
  useEffect(() => {
    if (!isLoaded) return;
    setData((prev) => {
      let needsMigration = false;
      for (const key of Object.keys(DEFAULT_APP_DATA)) {
        if (prev[key as keyof AppData] === undefined) {
          needsMigration = true;
          break;
        }
      }
      if (!needsMigration) return prev;
      return { ...DEFAULT_APP_DATA, ...prev };
    });
  }, [isLoaded, setData]);

  // Listen to Firebase auth state
  useEffect(() => {
    if (!auth) {
      setAuthChecked(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthChecked(true);
      // Sync Firebase UID → localStorage currentUserId
      if (user) {
        setData((prev) => {
          const existing = prev.users.find((u) => u.id === user.uid || u.email === user.email?.toLowerCase());
          if (existing) {
            // Update the profile id to Firebase UID if it differs (migration)
            const updatedUsers = prev.users.map((u) =>
              u.id === existing.id ? { ...u, id: user.uid, emailVerified: user.emailVerified } : u
            );
            return { ...prev, currentUserId: user.uid, users: updatedUsers };
          }
          return prev;
        });
      } else {
        setData((prev) => ({ ...prev, currentUserId: null }));
      }
    });
    return () => unsub();
  }, [setData]);

  // Merge with defaults so newly added fields are always present
  const data: AppData = useMemo(() => ({ ...DEFAULT_APP_DATA, ...rawData }), [rawData]);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === data.currentUserId) ?? null,
    [data.users, data.currentUserId]
  );

  const partner = useMemo(
    () => data.currentUserId ? data.users.find((u) => u.id !== data.currentUserId) ?? null : null,
    [data.users, data.currentUserId]
  );

  const isLoggedIn = !!currentUser && !!firebaseUser;
  const emailVerified = firebaseUser?.emailVerified ?? false;
  const isOnboardingComplete = data.onboardingComplete;
  const isLoading = !isLoaded || !authChecked;
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
  const firebaseErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/weak-password': return 'Password must be at least 6 characters';
      case 'auth/user-not-found': return 'No account found with this email';
      case 'auth/wrong-password': return 'Incorrect password';
      case 'auth/invalid-credential': return 'Invalid email or password';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later';
      case 'auth/popup-closed-by-user': return 'Sign-in was cancelled';
      case 'auth/account-exists-with-different-credential': return 'An account already exists with this email';
      default: return 'Something went wrong. Please try again';
    }
  };

  const logIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase not configured' };
    const trimEmail = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, trimEmail, password);
      // Ensure local profile exists
      const existing = data.users.find((u) => u.id === cred.user.uid || u.email === trimEmail);
      if (existing) {
        setData((prev) => ({ ...prev, currentUserId: cred.user.uid }));
      }
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      return { success: false, error: firebaseErrorMessage(code) };
    }
  };

  const logInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase not configured' };
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const gEmail = cred.user.email?.toLowerCase() ?? '';
      const gName = cred.user.displayName ?? 'User';
      // Check if a profile already exists
      const existing = data.users.find((u) => u.id === cred.user.uid || u.email === gEmail);
      if (existing) {
        setData((prev) => ({
          ...prev,
          currentUserId: cred.user.uid,
          users: prev.users.map((u) =>
            u.id === existing.id ? { ...u, id: cred.user.uid, emailVerified: true } : u
          ),
        }));
        return { success: true };
      }
      // No profile yet — create one (primary user)
      if (data.users.length >= 2) {
        await firebaseSignOut(auth);
        return { success: false, error: 'This space already has two members' };
      }
      const user: UserProfile = {
        id: cred.user.uid,
        name: gName,
        email: gEmail,
        emailVerified: true,
        avatarUrl: cred.user.photoURL ?? undefined,
        role: data.users.length === 0 ? 'primary' : 'partner',
        joinedAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        currentUserId: cred.user.uid,
        users: [...prev.users, user],
        couple: { ...prev.couple, person1: gName },
      }));
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      return { success: false, error: firebaseErrorMessage(code) };
    }
  };

  const logOut = async () => {
    if (auth) await firebaseSignOut(auth);
    setData((prev) => ({ ...prev, currentUserId: null }));
  };

  const signUp = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase not configured' };
    const trimEmail = email.trim().toLowerCase();
    const trimName = name.trim();
    if (!trimName) return { success: false, error: 'Name is required' };
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) return { success: false, error: 'Valid email is required' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };
    if (data.users.some((u) => u.email === trimEmail)) return { success: false, error: 'This email is already registered' };
    if (data.users.length >= 2) return { success: false, error: 'This space already has two members' };

    try {
      const cred = await createUserWithEmailAndPassword(auth, trimEmail, password);
      // Send verification email
      await sendEmailVerification(cred.user);

      const user: UserProfile = {
        id: cred.user.uid,
        name: trimName,
        email: trimEmail,
        emailVerified: false,
        role: 'primary',
        joinedAt: new Date().toISOString(),
      };

      setData((prev) => ({
        ...prev,
        currentUserId: cred.user.uid,
        users: [user],
        couple: { ...prev.couple, person1: trimName },
      }));

      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      return { success: false, error: firebaseErrorMessage(code) };
    }
  };

  const joinWithInvite = async (code: string, name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth || !db) return { success: false, error: 'Firebase not configured' };
    const trimCode = code.trim().toUpperCase();
    if (!trimCode) return { success: false, error: 'Please enter an invite code' };

    // Validate invite code from Firestore (works cross-device)
    try {
      const inviteRef = doc(db, 'invites', trimCode);
      const inviteSnap = await getDoc(inviteRef);
      if (!inviteSnap.exists()) {
        return { success: false, error: 'Invalid invite code. Please check and try again.' };
      }
      const inviteData = inviteSnap.data();
      if (inviteData.used) {
        return { success: false, error: 'This invite code has already been used' };
      }

      const trimEmail = email.trim().toLowerCase();
      const trimName = name.trim();
      if (!trimName) return { success: false, error: 'Name is required' };
      if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) return { success: false, error: 'Valid email is required' };
      if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

      const cred = await createUserWithEmailAndPassword(auth, trimEmail, password);
      await sendEmailVerification(cred.user);

      const user: UserProfile = {
        id: cred.user.uid,
        name: trimName,
        email: trimEmail,
        emailVerified: false,
        role: 'partner',
        joinedAt: new Date().toISOString(),
      };

      const now = new Date().toISOString();
      const starterDates = STARTER_DATES.map((d) => ({
        ...d,
        id: uuidv4(),
        done: false,
        createdAt: now,
      }));

      setData((prev) => ({
        ...prev,
        currentUserId: cred.user.uid,
        users: [...prev.users.filter((u) => u.id !== cred.user.uid), user],
        onboardingComplete: true,
        couple: { ...prev.couple, person2: trimName },
        invite: { code: trimCode, partnerJoined: true },
        dates: [...prev.dates, ...starterDates],
      }));

      // Mark invite as used in Firestore
      await updateDoc(inviteRef, { used: true, partnerUid: cred.user.uid, usedAt: serverTimestamp() });

      return { success: true };
    } catch (err: unknown) {
      const firebaseCode = (err as { code?: string }).code ?? '';
      if (firebaseCode) return { success: false, error: firebaseErrorMessage(firebaseCode) };
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  const joinWithInviteGoogle = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth || !db) return { success: false, error: 'Firebase not configured' };
    const trimCode = code.trim().toUpperCase();
    if (!trimCode) return { success: false, error: 'Please enter an invite code' };

    // Validate invite code from Firestore (works cross-device)
    try {
      const inviteRef = doc(db, 'invites', trimCode);
      const inviteSnap = await getDoc(inviteRef);
      if (!inviteSnap.exists()) {
        return { success: false, error: 'Invalid invite code. Please check and try again.' };
      }
      const inviteData = inviteSnap.data();
      if (inviteData.used) {
        return { success: false, error: 'This invite code has already been used' };
      }

      const cred = await signInWithPopup(auth, googleProvider);
      const gEmail = cred.user.email?.toLowerCase() ?? '';
      const gName = cred.user.displayName ?? 'Partner';

      const user: UserProfile = {
        id: cred.user.uid,
        name: gName,
        email: gEmail,
        emailVerified: true,
        avatarUrl: cred.user.photoURL ?? undefined,
        role: 'partner',
        joinedAt: new Date().toISOString(),
      };

      const now = new Date().toISOString();
      const starterDates = STARTER_DATES.map((d) => ({
        ...d,
        id: uuidv4(),
        done: false,
        createdAt: now,
      }));

      setData((prev) => ({
        ...prev,
        currentUserId: cred.user.uid,
        users: [...prev.users.filter((u) => u.id !== cred.user.uid), user],
        onboardingComplete: true,
        couple: { ...prev.couple, person2: gName },
        invite: { code: trimCode, partnerJoined: true },
        dates: [...prev.dates, ...starterDates],
      }));

      // Mark invite as used in Firestore
      await updateDoc(inviteRef, { used: true, partnerUid: cred.user.uid, usedAt: serverTimestamp() });

      return { success: true };
    } catch (err: unknown) {
      const firebaseCode = (err as { code?: string }).code ?? '';
      if (firebaseCode) return { success: false, error: firebaseErrorMessage(firebaseCode) };
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  const generateInviteCode = (): string => {
    // Re-use existing code if already generated and not used
    if (data.invite.code && !data.invite.partnerJoined) {
      return data.invite.code;
    }
    const code = uuidv4().slice(0, 8).toUpperCase();
    setData((prev) => ({ ...prev, invite: { ...prev.invite, code } }));
    // Persist invite to Firestore so partner can validate from their device
    if (db && firebaseUser) {
      const inviteRef = doc(db, 'invites', code);
      setDoc(inviteRef, {
        creatorUid: firebaseUser.uid,
        creatorEmail: firebaseUser.email ?? '',
        createdAt: serverTimestamp(),
        used: false,
      }).catch(() => {
        // Firestore write failed — code still works locally but won't work cross-device
      });
    }
    return code;
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseUser) return { success: false, error: 'Not logged in' };
    if (firebaseUser.emailVerified) return { success: false, error: 'Email is already verified' };
    try {
      await sendEmailVerification(firebaseUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to send verification email. Try again in a minute.' };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: 'Firebase not configured' };
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail) return { success: false, error: 'Please enter your email' };
    try {
      await sendPasswordResetEmail(auth, trimEmail);
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      return { success: false, error: firebaseErrorMessage(code) };
    }
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
      reading: [...(prev.reading ?? []), {
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
      const reading = prev.reading ?? [];
      const item = reading.find((r) => r.id === id);
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
      return { ...prev, reading: reading.map((r) => (r.id === id ? merged : r)) };
    });
  };

  const updateReadingProgress = (id: string, currentPage: number) => {
    updateReadingItem(id, { currentPage: Math.max(0, currentPage), status: 'reading' });
  };

  const deleteReadingItem = (id: string) => {
    setData((prev) => {
      const reading = prev.reading ?? [];
      const item = reading.find((r) => r.id === id);
      if (!item || !canEdit(myRole, item.tab)) return prev;
      const newRatings = { ...(prev.ratings ?? {}) };
      Object.keys(newRatings).forEach((key) => {
        if (key.startsWith(id + ':')) delete newRatings[key];
      });
      return { ...prev, reading: reading.filter((r) => r.id !== id), ratings: newRatings };
    });
  };

  // ----- Watch List -----
  const addWatchItem = (item: { title: string; type: WatchType; status: WatchStatus; notes?: string }) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    setData((prev) => ({
      ...prev,
      watchList: [...(prev.watchList ?? []), {
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
      watchList: (prev.watchList ?? []).map((w) => {
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
      const newRatings = { ...(prev.ratings ?? {}) };
      Object.keys(newRatings).forEach((key) => {
        if (key.startsWith(id + ':')) delete newRatings[key];
      });
      return { ...prev, watchList: (prev.watchList ?? []).filter((w) => w.id !== id), ratings: newRatings };
    });
  };

  // ----- Ratings (individual per-user) -----
  const rateItem = useCallback((itemId: string, rating: number, review?: string) => {
    if (!currentUser) return;
    const key = `${itemId}:${currentUser.id}`;
    setData((prev) => ({
      ...prev,
      ratings: {
        ...(prev.ratings ?? {}),
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
        firebaseUser,
        currentUser,
        partner,
        isLoggedIn,
        isOnboardingComplete,
        signUp,
        logIn,
        logInWithGoogle,
        logOut,
        joinWithInvite,
        joinWithInviteGoogle,
        generateInviteCode,
        resendVerificationEmail,
        resetPassword,
        emailVerified,
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