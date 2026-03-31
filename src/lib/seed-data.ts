import { AppData } from '@/types';

export const DEFAULT_APP_DATA: AppData = {
  currentUserId: null,
  users: [],
  onboardingComplete: false,
  couple: {
    person1: '',
    person2: '',
    anniversary: new Date().toISOString(),
  },
  invite: {
    code: null,
    partnerJoined: false,
  },
  loveMeter: {
    level: 50,
    person1Mood: {
      mood: 'happy',
      feeling: '',
      note: '',
      updatedAt: new Date().toISOString(),
    },
    person2Mood: {
      mood: 'happy',
      feeling: '',
      note: '',
      updatedAt: new Date().toISOString(),
    },
  },
  dates: [],
  memories: [],
  shopping: [],
  chores: [],
  reading: [],
  watchList: [],
  ratings: {},
  scores: {
    user1: 0,
    user2: 0,
    together: 0,
  },
};

export const STARTER_DATES = [
  {
    title: 'Movie night with blankets',
    description: 'Pick a comfort movie, make popcorn, and cuddle under a big blanket.',
    category: 'cozy' as const,
    emoji: '🎬',
  },
  {
    title: 'Sunrise hike',
    description: 'Wake up early, hike to a viewpoint, and watch the sunrise together.',
    category: 'adventure' as const,
    emoji: '🌄',
  },
  {
    title: 'Coffee & people watching',
    description: 'Find a cute café, get lattes, and just exist together.',
    category: 'low-energy' as const,
    emoji: '☕',
  },
  {
    title: 'Cook a fancy dinner',
    description: 'Pick a recipe neither of you has tried. Cook it together, candles and all.',
    category: 'special' as const,
    emoji: '🍝',
  },
  {
    title: 'Build a pillow fort',
    description: 'Yes, you are adults. No, that does not matter. Fort first, questions later.',
    category: 'cozy' as const,
    emoji: '🏰',
  },
];