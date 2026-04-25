'use client';

import React, { useEffect, useState } from 'react';
import styles from './MissionsModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { LEVEL_REWARDS } from '@/lib/levelRewards';

// ── Mission Definitions ────────────────────────────────────────────────────

interface Mission {
  id: string;
  tier: 'bronze' | 'silver' | 'gold' | 'legend';
  icon: string;
  title: string;
  desc: string;
  xpReward: number;
  reqAmount: number;
  avatarSeed?: string;
  getProgress: (user: ReturnType<typeof useAuth>['user']) => number;
}

const MISSIONS: Mission[] = [
  // ── BRONZE ──────────────────────────────────────────────────────────────
  {
    id: 'm_name',
    tier: 'bronze',
    icon: '✏️',
    title: 'Claim Your Identity',
    desc: 'Change your display name from the default.',
    xpReward: 100,
    reqAmount: 1,
    getProgress: (u) => (u?.name && u.name.toLowerCase() !== 'guest user' && u.name.toLowerCase() !== 'guest' ? 1 : 0),
  },
  {
    id: 'm_save1',
    tier: 'bronze',
    icon: '❤️',
    title: 'First Favourite',
    desc: 'Save 1 game to your personal library.',
    xpReward: 100,
    reqAmount: 1,
    getProgress: (u) => Math.min(u?.savedGames?.length || 0, 1),
  },
  {
    id: 'm_level5',
    tier: 'bronze',
    icon: '⬆️',
    title: 'Rookie Climber',
    desc: 'Reach Level 5.',
    xpReward: 150,
    reqAmount: 5,
    getProgress: (u) => Math.min(u?.level || 0, 5),
  },

  // ── SILVER ──────────────────────────────────────────────────────────────
  {
    id: 'm_save5',
    tier: 'silver',
    icon: '🗂️',
    title: 'The Collector',
    desc: 'Save 5 games to your library.',
    xpReward: 300,
    reqAmount: 5,
    avatarSeed: 'https://api.dicebear.com/7.x/bottts/svg?seed=Collector&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.savedGames?.length || 0, 5),
  },
  {
    id: 'm_level10',
    tier: 'silver',
    icon: '🏅',
    title: 'Veteran',
    desc: 'Reach Level 10.',
    xpReward: 400,
    reqAmount: 10,
    avatarSeed: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Veteran&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.level || 0, 10),
  },
  {
    id: 'm_save10',
    tier: 'silver',
    icon: '📚',
    title: 'Curator',
    desc: 'Save 10 games to your library.',
    xpReward: 500,
    reqAmount: 10,
    avatarSeed: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Curator&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.savedGames?.length || 0, 10),
  },

  // ── GOLD ────────────────────────────────────────────────────────────────
  {
    id: 'm_level25',
    tier: 'gold',
    icon: '⭐',
    title: 'Elite Gamer',
    desc: 'Reach Level 25.',
    xpReward: 1000,
    reqAmount: 25,
    avatarSeed: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Elite&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.level || 0, 25),
  },
  {
    id: 'm_save20',
    tier: 'gold',
    icon: '🏰',
    title: 'Archivist',
    desc: 'Save 20 games — build a real gaming library.',
    xpReward: 800,
    reqAmount: 20,
    avatarSeed: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Archivist&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.savedGames?.length || 0, 20),
  },
  {
    id: 'm_level50',
    tier: 'gold',
    icon: '👑',
    title: 'Master',
    desc: 'Reach Level 50 — halfway to Legend!',
    xpReward: 2000,
    reqAmount: 50,
    avatarSeed: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=master50&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.level || 0, 50),
  },
  {
    id: 'm_missions5',
    tier: 'gold',
    icon: '🎯',
    title: 'Mission Veteran',
    desc: 'Complete 5 missions total.',
    xpReward: 600,
    reqAmount: 5,
    getProgress: (u) => Math.min(u?.completedMissions?.length || 0, 5),
  },

  // ── LEGEND ──────────────────────────────────────────────────────────────
  {
    id: 'm_level75',
    tier: 'legend',
    icon: '🔥',
    title: 'Conqueror',
    desc: 'Reach Level 75 — an incredible achievement.',
    xpReward: 4000,
    reqAmount: 75,
    avatarSeed: 'https://api.dicebear.com/7.x/lorelei/svg?seed=conqueror75&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.level || 0, 75),
  },
  {
    id: 'm_save50',
    tier: 'legend',
    icon: '🌌',
    title: 'Galaxy Brain',
    desc: 'Save 50 games to your library.',
    xpReward: 3000,
    reqAmount: 50,
    avatarSeed: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=GalaxyBrain&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.savedGames?.length || 0, 50),
  },
  {
    id: 'm_level100',
    tier: 'legend',
    icon: '⚡',
    title: '⚡ TRUE LEGEND',
    desc: 'Reach Level 100. You have conquered the portal.',
    xpReward: 10000,
    reqAmount: 100,
    avatarSeed: 'https://api.dicebear.com/7.x/bottts/svg?seed=legend100Ultimate&backgroundColor=transparent',
    getProgress: (u) => Math.min(u?.level || 0, 100),
  },
];

const TIER_LABELS = {
  bronze: { label: '🟤 Bronze', color: '#cd7f32' },
  silver: { label: '⚪ Silver', color: '#c0c0c0' },
  gold:   { label: '🟡 Gold',   color: '#FFD700' },
  legend: { label: '⚡ Legend', color: '#a78bfa' },
};

// ── Component ──────────────────────────────────────────────────────────────

// ── Shop Definitions ───────────────────────────────────────────────────────

interface ShopItem {
  id: string;
  name: string;
  type: 'avatar' | 'frame' | 'banner';
  value: string;
  cost: number;
  icon: string;
  currency?: 'coins' | 'gems';
}

const SHOP_ITEMS: ShopItem[] = [
  // COIN ITEMS
  { id: 'sh_av1', name: 'Cyber Samurai', type: 'avatar', cost: 500, value: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samurai', icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Samurai', currency: 'coins' },
  { id: 'sh_av2', name: 'Neon Robot', type: 'avatar', cost: 1000, value: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neon', icon: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neon', currency: 'coins' },
  { id: 'sh_fr1', name: 'Cyber Blue', type: 'frame', cost: 1500, value: 'linear-gradient(135deg, #00d2ff, #3a7bd5)', icon: '🟦', currency: 'coins' },
  { id: 'sh_fr2', name: 'Gold Rush', type: 'frame', cost: 2500, value: 'linear-gradient(135deg, #FFD700, #FFA500)', icon: '✨', currency: 'coins' },
  { id: 'sh_bn1', name: 'Valorant Legend', type: 'banner', cost: 2000, value: 'https://images.alphacoders.com/132/1322237.png', icon: '🖼️', currency: 'coins' },
  
  // GEM ITEMS (EARNED BY PLAYING)
  { id: 'sh_g1', name: 'Ghost Emoji', type: 'avatar', cost: 50, value: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost&mood=surprised', icon: '👻', currency: 'gems' },
  { id: 'sh_g2', name: 'Pixel Slime', type: 'avatar', cost: 100, value: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Slime', icon: '🧪', currency: 'gems' },
  { id: 'sh_g3', name: 'Dragon Spirit', type: 'avatar', cost: 200, value: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dragon', icon: '🐉', currency: 'gems' },
  { id: 'sh_g4', name: 'Cyber Cat', type: 'avatar', cost: 150, value: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Cat', icon: '🐱', currency: 'gems' },
  { id: 'sh_bn9', name: 'God of War: Ragnarok', type: 'banner', cost: 5000, value: 'https://images.alphacoders.com/116/1161273.jpg', icon: '🖼️', currency: 'coins' },
];

export default function MissionsModal() {
  const { user, isMissionsModalOpen, closeMissionsModal, claimMission, purchaseItem } = useAuth();
  const [activeTab, setActiveTab] = useState<'missions' | 'shop'>('missions');
  const [activeTier, setActiveTier] = useState<'all' | Mission['tier']>('all');

  useEffect(() => {
    if (isMissionsModalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMissionsModalOpen]);

  if (!isMissionsModalOpen || !user) return null;

  const handleClaim = (m: Mission) => {
    claimMission(m.id, m.xpReward, m.avatarSeed);
  };

  const filtered = activeTier === 'all' ? MISSIONS : MISSIONS.filter(m => m.tier === activeTier);
  const completedCount = MISSIONS.filter(m => user.completedMissions?.includes(m.id)).length;

  return (
    <div className={styles.modalOverlay} onClick={closeMissionsModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeMissionsModal}>
          <span className="material-icons-round">close</span>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h2>{activeTab === 'missions' ? '🎯 Missions' : '🛒 Rewards Shop'}</h2>
            <div className={styles.balances}>
              <div className={styles.coinBalance}>
                <span className="material-icons-round" style={{ color: '#FBBC05' }}>monetization_on</span>
                <span>{user.coins?.toLocaleString() || 0}</span>
              </div>
              <div className={styles.gemBalance}>
                <span className="material-icons-round" style={{ color: '#00F260' }}>diamond</span>
                <span>{user.gems?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
          <p>{activeTab === 'missions' ? 'Complete missions to earn XP and coins!' : 'Unlock premium avatars, frames, and banners.'}</p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabs}>
           <button className={`${styles.tabBtn} ${activeTab === 'missions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('missions')}>Missions</button>
           <button className={`${styles.tabBtn} ${activeTab === 'shop' ? styles.tabActive : ''}`} onClick={() => setActiveTab('shop')}>Shop</button>
        </div>

        {activeTab === 'missions' ? (
          <>
            {/* Tier Filter */}
            <div className={styles.tierFilter}>
              <button className={`${styles.tierBtn} ${activeTier === 'all' ? styles.tierActive : ''}`} onClick={() => setActiveTier('all')}>All</button>
              {(['bronze','silver','gold','legend'] as const).map(t => (
                <button
                  key={t}
                  className={`${styles.tierBtn} ${activeTier === t ? styles.tierActive : ''}`}
                  onClick={() => setActiveTier(t)}
                  style={activeTier === t ? { borderColor: TIER_LABELS[t].color, color: TIER_LABELS[t].color } : {}}
                >
                  {TIER_LABELS[t].label}
                </button>
              ))}
            </div>

            {/* Missions list */}
            <div className={styles.missionsList}>
              {filtered.map((m) => {
                const isCompleted = user.completedMissions?.includes(m.id);
                const progress = m.getProgress(user);
                const canClaim = !isCompleted && progress >= m.reqAmount;
                const pct = Math.round((progress / m.reqAmount) * 100);
                const tierColor = TIER_LABELS[m.tier].color;

                return (
                  <div
                    key={m.id}
                    className={`${styles.missionCard} ${isCompleted ? styles.completed : ''} ${canClaim ? styles.claimable : ''}`}
                    style={{ '--tier-color': tierColor } as React.CSSProperties}
                  >
                    <div className={styles.missionIcon}>{m.icon}</div>
                    <div className={styles.missionInfo}>
                      <div className={styles.missionTop}>
                        <h3>{m.title}</h3>
                        <span className={styles.tierPip} style={{ background: tierColor }}>{m.tier.toUpperCase()}</span>
                      </div>
                      <p>{m.desc}</p>
                      <div className={styles.progressRow}>
                        <div className={styles.progressBarBg}>
                          <div
                            className={styles.progressBarFill}
                            style={{ width: `${pct}%`, background: isCompleted ? '#34C759' : `linear-gradient(90deg, ${tierColor}, #7B5EFF)` }}
                          />
                        </div>
                        <span className={styles.progressText}>{progress} / {m.reqAmount}</span>
                      </div>
                      <div className={styles.rewardsRow}>
                        <span className={styles.xpBadge}>+{m.xpReward.toLocaleString()} XP</span>
                      </div>
                    </div>
                    <div className={styles.actionZone}>
                      {isCompleted ? (
                        <span className={styles.claimedBadge}>✓</span>
                      ) : canClaim ? (
                        <button className={styles.claimBtn} onClick={() => handleClaim(m)}>CLAIM</button>
                      ) : (
                        <div className={styles.lockedZone}>
                          <span className="material-icons-round" style={{ fontSize: 16, color: '#555' }}>lock</span>
                          <span className={styles.pctText}>{pct}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={styles.shopGrid}>
            {SHOP_ITEMS.map(item => {
              const isOwned = (item.type === 'avatar' && user.unlockedAvatars?.includes(item.value)) ||
                              (item.type === 'frame' && user.unlockedFrames?.includes(item.value)) ||
                              (item.type === 'banner' && user.unlockedBanners?.includes(item.value));
              const canAfford = item.currency === 'gems' ? (user.gems || 0) >= item.cost : (user.coins || 0) >= item.cost;

              return (
                <div key={item.id} className={`${styles.shopCard} ${isOwned ? styles.owned : ''}`}>
                  <div className={styles.shopPreview} style={item.type === 'frame' ? { background: item.value } : item.type === 'banner' ? { backgroundImage: `url(${item.value})`, backgroundSize: 'cover' } : {}}>
                    {item.type === 'avatar' && <img src={item.icon} alt={item.name} />}
                    {item.type !== 'avatar' && <span className={styles.shopItemIcon}>{item.icon}</span>}
                  </div>
                  <div className={styles.shopDetails}>
                    <h4>{item.name}</h4>
                    <span className={styles.itemTypeTag}>{item.type}</span>
                    <button 
                      className={styles.buyBtn}
                      onClick={() => purchaseItem(item.cost, item.type, item.value, item.currency)}
                      disabled={isOwned || !canAfford}
                    >
                      {isOwned ? 'OWNED' : `${item.currency === 'gems' ? '💎' : '🪙'} ${item.cost}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
