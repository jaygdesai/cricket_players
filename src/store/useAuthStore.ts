import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOut } from '../firebase/auth';
import { getUserProfile, createUserProfile, updateUserProfile } from '../firebase/firestore';
import type { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  syncProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  signIn: async () => {
    try {
      const user = await signInWithGoogle();
      set({ user });
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        profile = await createUserProfile(user.uid, user.displayName || 'Player');
      }
      set({ profile });
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  },

  signOutUser: async () => {
    await signOut();
    set({ user: null, profile: null });
  },

  syncProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profile = await getUserProfile(user.uid);
    if (profile) set({ profile });
  },

  updateProfile: async (data) => {
    const { user, profile } = get();
    if (!user || !profile) return;
    await updateUserProfile(user.uid, data);
    set({ profile: { ...profile, ...data } });
  },

  initAuth: () => {
    onAuthChange(async (user) => {
      if (user) {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          profile = await createUserProfile(user.uid, user.displayName || 'Player');
        }
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },
}));
