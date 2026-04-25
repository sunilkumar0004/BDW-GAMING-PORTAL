'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
// ✅ Import at module level — not inside functions (require() fails in browser)
import {
  levelFromXp,
  MAX_LEVEL,
  XP_PER_LEVEL,
  LEVEL_REWARDS,
} from '@/lib/levelRewards';

export type User = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  savedGames?: string[];
  xp?: number;
  level?: number;
  coins?: number;             // Currency for the store
  gems?: number;              // New currency earned ONLY by playing
  currentFrame?: string;      // Current active profile frame (CSS gradient)
  currentBanner?: string;     // Current active profile banner URL
  unlockedAvatars?: string[];
  unlockedFrames?: string[];
  unlockedBanners?: string[];
  completedMissions?: string[];
};

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleSavedGame: (gameId: string) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  isMissionsModalOpen: boolean;
  openMissionsModal: () => void;
  closeMissionsModal: () => void;
  isFeedbackModalOpen: boolean;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  // ✅ claimMission does XP + mission mark in ONE atomic update to prevent race
  claimMission: (missionId: string, xpAmount: number, rewardAvatarUrl?: string) => void;
  addXp: (amount: number) => void;
  completeMission: (missionId: string, customRewardAvatar?: string) => void;
  purchaseItem: (cost: number, itemType: 'avatar' | 'frame' | 'banner', itemValue: string, currency?: 'coins' | 'gems') => void;
  rewardCoins: (amount: number) => void;
  rewardGems: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInternal>{children}</AuthContextInternal>
    </SessionProvider>
  );
}

function AuthContextInternal({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync session with local user
  useEffect(() => {
    if (!isMounted) return;

    if (status === 'authenticated' && session?.user) {
      const savedUser = localStorage.getItem('poki_clone_user');
      let localUser: User | null = null;
      if (savedUser) {
        try { localUser = JSON.parse(savedUser); } catch (e) {}
      }

      // If no local user OR if the local user is a different person (by email), update
      if (!localUser || localUser.email !== session.user.email) {
        const externalId = (session.user as any).id || `oauth_${Date.now()}`;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const secret = process.env.NEXT_PUBLIC_API_SECRET || 'dev_secret_key_123';
        
        // Try fetching from DB first
        fetch(`${baseUrl}/api/user/${externalId}`, {
          headers: { 'x-api-key': secret }
        })
          .then(res => res.json())
          .then(dbUser => {
             const newUser: User = {
               id: externalId,
               name: session.user?.name || 'User',
               email: session.user?.email || '',
               avatar: session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`,
               xp: dbUser.xp ?? localUser?.xp ?? 0,
               level: dbUser.level ?? localUser?.level ?? 0,
               coins: dbUser.coins ?? localUser?.coins ?? 0,
               gems: dbUser.gems ?? localUser?.gems ?? 0,
               savedGames: dbUser.savedGames ?? localUser?.savedGames ?? [],
               completedMissions: dbUser.completedMissions ?? localUser?.completedMissions ?? [],
               unlockedAvatars: dbUser.unlockedAvatars ?? localUser?.unlockedAvatars ?? [],
               unlockedFrames: dbUser.unlockedFrames ?? localUser?.unlockedFrames ?? [],
               unlockedBanners: dbUser.unlockedBanners ?? localUser?.unlockedBanners ?? [],
               currentFrame: dbUser.currentFrame ?? localUser?.currentFrame,
               currentBanner: dbUser.currentBanner ?? localUser?.currentBanner,
             };
             setUser(newUser);
             localStorage.setItem('poki_clone_user', JSON.stringify(newUser));
          })
          .catch(() => {
             // Fallback to purely local if DB fetch fails
             const newUser: User = {
                id: externalId,
                name: session.user?.name || 'User',
                email: session.user?.email || '',
                avatar: session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`,
                xp: localUser?.xp || 0,
                level: localUser?.level || 0,
                savedGames: localUser?.savedGames || [],
                completedMissions: localUser?.completedMissions || [],
                unlockedAvatars: localUser?.unlockedAvatars || [],
             };
             setUser(newUser);
             localStorage.setItem('poki_clone_user', JSON.stringify(newUser));
          });
      }
    }
  }, [session, status, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const savedUser = localStorage.getItem('poki_clone_user');
    if (savedUser && !user) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    }
  }, [isMounted, user]);

  const syncToDb = useCallback(async (userData: User) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const secret = process.env.NEXT_PUBLIC_API_SECRET || 'dev_secret_key_123';
      await fetch(`${baseUrl}/api/user/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': secret
        },
        body: JSON.stringify({ externalId: userData.id, ...userData }),
      });
    } catch (err) {
      console.error('Failed to sync progress to DB:', err);
    }
  }, []);

  // ── Persist helper ──────────────────────────────────────────────────────
  const persist = useCallback((updated: User) => {
    setUser(updated);
    localStorage.setItem('poki_clone_user', JSON.stringify(updated));
    syncToDb(updated);
  }, [syncToDb]);

  // ── Auth ────────────────────────────────────────────────────────────────
  const login = (newUser: User) => persist(newUser);
  const logout = () => {
    setUser(null);
    localStorage.removeItem('poki_clone_user');
  };

  // ── Generic update ──────────────────────────────────────────────────────
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Toggle saved game ───────────────────────────────────────────────────
  const toggleSavedGame = (gameId: string) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    updateUser({
      savedGames: user.savedGames?.includes(gameId)
        ? user.savedGames.filter(id => id !== gameId)
        : [...(user.savedGames || []), gameId],
    });
  };

  // ── XP helper (pure): compute new xp/level/unlocked assets ─────────────
  const computeXpGain = (currentUser: User, amount: number) => {
    const currentXp = currentUser.xp || 0;
    const currentLevel = currentUser.level || 0;
    const currentCoins = currentUser.coins || 0;
    const newXp = Math.min(currentXp + amount, MAX_LEVEL * XP_PER_LEVEL);
    const newLevel = levelFromXp(newXp);

    let unlockedAvatars = [...(currentUser.unlockedAvatars || [])];
    let unlockedFrames = [...(currentUser.unlockedFrames || [])];
    let unlockedBanners = [...(currentUser.unlockedBanners || [])];
    let coins = currentCoins;

    if (newLevel > currentLevel) {
      for (let lvl = currentLevel + 1; lvl <= newLevel; lvl++) {
        const reward = LEVEL_REWARDS[lvl];
        if (reward) {
          if (reward.avatarUrl && !unlockedAvatars.includes(reward.avatarUrl)) unlockedAvatars.push(reward.avatarUrl);
          if (reward.frameColor && !unlockedFrames.includes(reward.frameColor)) unlockedFrames.push(reward.frameColor);
          if (reward.bannerUrl && !unlockedBanners.includes(reward.bannerUrl)) unlockedBanners.push(reward.bannerUrl);
          if (reward.coins) coins += reward.coins;
          if (reward.xpBonus) {
            // We don't recursively call computeXpGain for bonus XP to avoid infinite loops, 
            // but we can add it to the final XP total here.
            // (In a real app, you'd handle this more robustly)
          }
        }
      }
    }
    return { xp: newXp, level: newLevel, coins, unlockedAvatars, unlockedFrames, unlockedBanners };
  };

  // ── addXp (standalone) ──────────────────────────────────────────────────
  const addXp = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const xpUpdates = computeXpGain(prev, amount);
      const next = { ...prev, ...xpUpdates };
      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── claimMission: atomic update ────────────────────────────────────────
  const claimMission = useCallback((missionId: string, xpAmount: number, rewardAvatarUrl?: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const cm = prev.completedMissions || [];
      if (cm.includes(missionId)) return prev;

      const updates = computeXpGain(prev, xpAmount);
      const completedMissions = [...cm, missionId];
      
      let unlockedAvatars = updates.unlockedAvatars;
      if (rewardAvatarUrl && !unlockedAvatars.includes(rewardAvatarUrl)) {
        unlockedAvatars = [...unlockedAvatars, rewardAvatarUrl];
      }

      const next: User = {
        ...prev,
        ...updates,
        unlockedAvatars,
        completedMissions,
      };

      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const purchaseItem = useCallback((cost: number, itemType: 'avatar' | 'frame' | 'banner', itemValue: string, currency: 'coins' | 'gems' = 'coins') => {
    setUser(prev => {
      if (!prev) return prev;
      
      const balance = currency === 'gems' ? (prev.gems || 0) : (prev.coins || 0);
      if (balance < cost) return prev;
      
      const next = { ...prev };
      if (currency === 'gems') {
        next.gems = (prev.gems || 0) - cost;
      } else {
        next.coins = (prev.coins || 0) - cost;
      }
      
      if (itemType === 'avatar') next.unlockedAvatars = [...(prev.unlockedAvatars || []), itemValue];
      if (itemType === 'frame') next.unlockedFrames = [...(prev.unlockedFrames || []), itemValue];
      if (itemType === 'banner') next.unlockedBanners = [...(prev.unlockedBanners || []), itemValue];
      
      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      syncToDb(next);
      return next;
    });
  }, [syncToDb]);

  const rewardCoins = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, coins: (prev.coins || 0) + amount };
      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      syncToDb(next);
      return next;
    });
  }, [syncToDb]);

  const rewardGems = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, gems: (prev.gems || 0) + amount };
      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      syncToDb(next);
      return next;
    });
  }, [syncToDb]);

  // ── completeMission (legacy compat — just marks, no XP) ────────────────
  const completeMission = useCallback((missionId: string, rewardAvatarUrl?: string) => {
    setUser(prev => {
      if (!prev) return prev;
      const cm = prev.completedMissions || [];
      if (cm.includes(missionId)) return prev;
      const completedMissions = [...cm, missionId];
      let unlockedAvatars = [...(prev.unlockedAvatars || [])];
      if (rewardAvatarUrl && !unlockedAvatars.includes(rewardAvatarUrl)) {
        unlockedAvatars = [...unlockedAvatars, rewardAvatarUrl];
      }
      const next = { ...prev, completedMissions, unlockedAvatars };
      localStorage.setItem('poki_clone_user', JSON.stringify(next));
      return next;
    });
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateUser,
        toggleSavedGame,
        addXp,
        claimMission,
        completeMission,
        purchaseItem,
        rewardCoins,
        rewardGems,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isEditProfileModalOpen,
        openEditProfileModal: () => setIsEditProfileModalOpen(true),
        closeEditProfileModal: () => setIsEditProfileModalOpen(false),
        isMissionsModalOpen,
        openMissionsModal: () => setIsMissionsModalOpen(true),
        closeMissionsModal: () => setIsMissionsModalOpen(false),
        isFeedbackModalOpen,
        openFeedbackModal: () => setIsFeedbackModalOpen(true),
        closeFeedbackModal: () => setIsFeedbackModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
