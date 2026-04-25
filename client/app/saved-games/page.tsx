'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import GameGrid from '@/components/GameGrid/GameGrid';

export default function SavedGamesPage() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className={styles.emptyContainer}>
        <span className="material-icons-round" style={{ fontSize: 64, color: '#ff4d4f' }}>
          lock_person
        </span>
        <h2>Sign in to view Saved Games</h2>
        <p>You need to log into an account to access your personal library.</p>
      </div>
    );
  }

  if (!user.savedGames || user.savedGames.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className="material-icons-round" style={{ fontSize: 64, color: '#00d2ff' }}>
          videogame_asset_off
        </span>
        <h2>No Saved Games Yet!</h2>
        <p>Explore the homepage and click the Heart icon on any game to add it to your library.</p>
      </div>
    );
  }

  const savedIdsString = user.savedGames.join(',');

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <span className="material-icons-round" style={{ color: '#ff4b4b' }}>favorite</span>
        <h1>My Saved Games</h1>
        <span className={styles.badge}>{user.savedGames.length} Total</span>
      </div>
      
      <GameGrid ids={savedIdsString} />
    </div>
  );
}
