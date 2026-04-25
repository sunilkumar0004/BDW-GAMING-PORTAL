'use client';

import React from 'react';
import styles from './ProfileDropdown.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MAX_LEVEL, XP_PER_LEVEL, xpProgressFraction } from '@/lib/levelRewards';

interface ProfileDropdownProps {
  onClose: () => void;
}

// High Quality SVGs replacing broken material icons
const EditIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const HeartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const TargetIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const TrophyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>;
const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

export default function ProfileDropdown({ onClose }: ProfileDropdownProps) {
  const { user, logout, openEditProfileModal, openMissionsModal, openFeedbackModal } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const currentLevel = user.level || 0;
  const currentXp = user.xp || 0;
  const isMaxLevel = currentLevel >= MAX_LEVEL;
  const xpPercent = isMaxLevel ? 100 : Math.round(xpProgressFraction(currentXp) * 100);
  const xpToNext = isMaxLevel ? 0 : (XP_PER_LEVEL - (currentXp % XP_PER_LEVEL));
  const gamesPlayed = user.savedGames?.length || 0;
  const achievements = user.completedMissions?.length || 0;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleEditProfile = () => {
    onClose();
    openEditProfileModal();
  };

  const handleMySavedGames = () => {
    onClose();
    router.push('/saved-games');
  };

  return (
    <div className={styles.dropdownContainer}>
      <div className={styles.header}>
        <img src={user.avatar} alt="Avatar" className={styles.avatarLg} />
        <div className={styles.userInfo}>
          <h3 className={styles.name}>{user.name}</h3>
          <p className={styles.email}>{user.email || 'No email linked'}</p>
          <div className={styles.userBadge}>Level {currentLevel}<span style={{ opacity: 0.5, fontSize: 10, marginLeft: 4 }}>/ {MAX_LEVEL}</span></div>
        </div>
      </div>

      <div className={styles.xpBox}>
        <div className={styles.xpHeader}>
          <span>XP Progress</span>
          <span>{isMaxLevel ? '🏆 MAX' : `${xpPercent}%`}</span>
        </div>
        <div className={styles.xpBarBg}>
          <div className={styles.xpBarFill} style={{ width: `${xpPercent}%` }}></div>
        </div>
        <p className={styles.xpSub}>{isMaxLevel ? 'Max level achieved!' : `${xpToNext} XP to next level`}</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statIcon} style={{ color: '#00d2ff' }}><TargetIcon /></span>
          <div className={styles.statData}>
            <span className={styles.statValue}>{gamesPlayed}</span>
            <span className={styles.statTitle}>Played</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon} style={{ color: '#FBBC05' }}><TrophyIcon /></span>
          <div className={styles.statData}>
            <span className={styles.statValue}>{achievements}</span>
            <span className={styles.statTitle}>Unlocked</span>
          </div>
        </div>
      </div>

      <div className={styles.menu}>
        <button className={styles.menuItem} onClick={() => { onClose(); openMissionsModal(); }}>
          <StarIcon />
          Missions & Rewards
        </button>
        <button className={styles.menuItem} onClick={handleEditProfile}>
          <EditIcon />
          Edit Profile
        </button>
        <button className={styles.menuItem} onClick={handleMySavedGames}>
          <HeartIcon />
          My Saved Games
        </button>
        <button className={styles.menuItem} onClick={onClose}>
          <SettingsIcon />
          Preferences
        </button>
        <button className={styles.menuItem} onClick={() => { onClose(); openFeedbackModal(); }}>
          <StarIcon />
          Rate Website
        </button>
        <button className={`${styles.menuItem} ${styles.logoutBtn}`} onClick={handleLogout}>
          <LogoutIcon />
          Sign Out
        </button>
      </div>
    </div>
  );
}
