'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './LevelUpModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { LEVEL_REWARDS, getRewardForLevel } from '@/lib/levelRewards';

export default function LevelUpModal() {
  const { user } = useAuth();
  const prevLevelRef = useRef<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [achievedLevel, setAchievedLevel] = useState(0);

  useEffect(() => {
    const currentLevel = user?.level ?? 0;
    // On first mount, just record the level — don't pop up
    if (prevLevelRef.current === null) {
      prevLevelRef.current = currentLevel;
      return;
    }
    if (currentLevel > prevLevelRef.current) {
      setAchievedLevel(currentLevel);
      setShowModal(true);
      prevLevelRef.current = currentLevel;
    }
  }, [user?.level]);

  if (!showModal) return null;

  const reward = getRewardForLevel(achievedLevel);
  const milestoneReward = LEVEL_REWARDS[achievedLevel];

  return (
    <div className={styles.overlay} onClick={() => setShowModal(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Particle burst */}
        <div className={styles.burst}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        <div className={styles.badge}>
          <span className={styles.badgeLevel}>{achievedLevel}</span>
          <span className={styles.badgeLabel}>LEVEL UP!</span>
        </div>

        <h2 className={styles.title}>
          {reward?.title || `Level ${achievedLevel}`}
        </h2>
        <p className={styles.desc}>{reward?.description || `You've reached Level ${achievedLevel}!`}</p>

        {milestoneReward?.avatarUrl && (
          <div className={styles.avatarReward}>
            <div className={styles.avatarGlow}>
              <img src={milestoneReward.avatarUrl} alt="Avatar Unlocked" />
            </div>
            <span className={styles.avatarLabel}>🎁 New Avatar Unlocked!</span>
          </div>
        )}

        {milestoneReward?.xpBonus && (
          <div className={styles.xpBurst}>+{milestoneReward.xpBonus} Bonus XP Milestone!</div>
        )}

        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
}
