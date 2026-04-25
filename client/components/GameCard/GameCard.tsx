'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Game } from '@/types/game';
import GamePlayer from '@/components/GamePlayer/GamePlayer';
import GameDetailModal from '@/components/GameDetailModal/GameDetailModal';
import { useAuth } from '@/context/AuthContext';
import styles from './GameCard.module.css';
import React, { memo } from 'react';

interface GameCardProps {
  game: Game;
}

const PLATFORM_ICONS: Record<string, string> = {
  mobile: 'smartphone',
  pc: 'computer',
  browser: 'language',
  ps5: 'sports_esports',
  xbox: 'sports_esports',
};

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  browser:  { label: 'Play Now',     icon: 'play_arrow' },
  mobile:   { label: 'Download',     icon: 'download' },
  download: { label: 'Get Game',     icon: 'download' },
};

const GameCard = ({ game }: GameCardProps) => {
  const [open, setOpen] = useState(false);
  const { user, toggleSavedGame } = useAuth();
  
  const isBrowser = !game.type || game.type === 'browser';
  const typeInfo = TYPE_LABELS[game.type || 'browser'];
  
  const isSaved = user?.savedGames?.includes(game.id) || false;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedGame(game.id);
  };

  return (
    <>
      <article
        className={`${styles.card} ${game.isFeatured ? styles.featured : ''} ${!isBrowser ? styles.downloadCard : ''}`}
        onClick={() => setOpen(true)}
        tabIndex={0}
        role="button"
        aria-label={`${isBrowser ? 'Play' : 'View'} ${game.title}`}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={game.image}
            alt={game.title}
            fill
            sizes="(max-width: 600px) 140px, (max-width: 1024px) 180px, 220px"
            className={styles.image}
            loading="lazy"
            unoptimized={true} // High-res game art from CDNs shouldn't be re-compressed by Next.js to save local processing
          />

          {/* Hover overlay */}
          <div className={styles.overlay}>
            <div className={styles.actionBtn}>
              <span className="material-icons-round">{typeInfo.icon}</span>
            </div>
            <span className={styles.actionLabel}>{typeInfo.label}</span>
          </div>

          {/* Bookmark Heart */}
          <button 
            className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`} 
            onClick={handleSaveClick}
            aria-label="Save game"
          >
            <span className="material-icons-round">
              {isSaved ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          {/* Badges */}
          <div className={styles.badges}>
            {game.isNew && <span className={styles.badgeNew}>NEW</span>}
            {game.type && game.type !== 'browser' && (
              <span className={`${styles.badgeType} ${game.type === 'mobile' ? styles.badgeMobile : styles.badgePC}`}>
                <span className="material-icons-round">
                  {game.type === 'mobile' ? 'smartphone' : 'download'}
                </span>
                {game.type === 'mobile' ? 'APK' : 'PC'}
              </span>
            )}
          </div>

          {/* Rating chip */}
          {game.rating !== undefined && (
            <div className={styles.ratingChip}>
              <span className="material-icons-round">star</span>
              {game.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className={styles.info}>
          {/* Platform icons */}
          {game.platforms && game.platforms.length > 0 && (
            <div className={styles.platformIcons}>
              {game.platforms.slice(0, 3).map((p) => (
                <span key={p} className={`material-icons-round ${styles.platformIcon}`} title={p}>
                  {PLATFORM_ICONS[p] || 'gamepad'}
                </span>
              ))}
            </div>
          )}
          <div className={styles.category}>{game.category}</div>
          <p className={styles.title}>{game.title}</p>
          {game.downloads && <p className={styles.downloads}>{game.downloads} downloads</p>}
        </div>
      </article>

      {open && isBrowser && (
        <GamePlayer game={game} onClose={() => setOpen(false)} />
      )}
      {open && !isBrowser && (
        <GameDetailModal game={game} onClose={() => setOpen(false)} />
      )}
    </>
  );
};

export default memo(GameCard, (prev, next) => {
  return prev.game.id === next.game.id && prev.game.rating === next.game.rating;
});
