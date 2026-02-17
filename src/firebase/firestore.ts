import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './config';
import type { UserProfile } from '../types';

export const createUserProfile = async (uid: string, displayName: string): Promise<UserProfile> => {
  const profile: UserProfile = {
    uid,
    displayName,
    coins: 500,
    totalScore: 0,
    streak: 0,
    bestStreak: 0,
    collection: [],
    dreamXI: [],
    dailyChallengeDate: '',
    gamesPlayed: 0,
    gamesWon: 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', uid), profile);
  return profile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const getLeaderboard = async (limitCount = 100) => {
  const q = query(collection(db, 'users'), orderBy('totalScore', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserProfile);
};
