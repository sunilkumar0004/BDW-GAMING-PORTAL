'use client';

import { useEffect, useRef, useState } from 'react';
import { Game } from '@/types/game';
import styles from './GamePlayer.module.css';
import { useAuth } from '@/context/AuthContext';
import ReviewSection from '@/components/ReviewSection/ReviewSection';
import { useGame } from '@/hooks/useGames';

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
}

export default function GamePlayer({ game: initialGame, onClose }: GamePlayerProps) {
  const { isLoggedIn, rewardCoins, rewardGems } = useAuth();
  const { game, mutate } = useGame(initialGame.id);
  const currentGame = game || initialGame;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const rewardedRef = useRef(false);

  // Reward on play: 100 Coins + 10 Gems (Play-only currency)
  useEffect(() => {
    if (isLoggedIn && !rewardedRef.current) {
      rewardCoins(100);
      rewardGems(10);
      rewardedRef.current = true;
      console.log('User rewarded 100 Coins + 10 Gems for playing:', currentGame.title);
    }
  }, [isLoggedIn, rewardCoins, rewardGems, currentGame.title]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  };

  const handleReport = () => {
    alert(`Thank you for reporting "${currentGame.title}". Our team will check it!`);
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.gameInfo}>
            <span className={`material-icons-round ${styles.gameIcon}`}>sports_esports</span>
            <div>
              <p className={styles.gameTitle}>{currentGame.title}</p>
              <div className={styles.subInfo}>
                <p className={styles.gameCategory}>{currentGame.category}</p>
                <div className={styles.rating}>
                  <span className="material-icons-round">star</span>
                  {currentGame.rating?.toFixed(1) || '0.0'}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.controlBtn}
              onClick={handleReport}
              title="Report Issue"
              aria-label="Report issue"
            >
              <span className="material-icons-round">report_problem</span>
            </button>
            <button
              className={styles.controlBtn}
              onClick={handleFullscreen}
              title="Fullscreen (F)"
              aria-label="Fullscreen"
            >
              <span className="material-icons-round">fullscreen</span>
            </button>
            <button
              className={`${styles.controlBtn} ${styles.closeBtn}`}
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close game"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>
        </div>

        {/* iFrame */}
        <div className={styles.iframeWrapper}>
          {isLoading && (
            <div className={styles.loader}>
              <div className={styles.spinner} />
              <p>Loading Game...</p>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={currentGame.url}
            className={styles.iframe}
            allow="autoplay; fullscreen; microphone; camera; clipboard-write; gamepad"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock"
            title={currentGame.title}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsContainer}>
          <ReviewSection 
            gameId={currentGame.id} 
            onReviewSubmitted={() => mutate()} 
            initialRating={currentGame.rating}
            initialReviewCount={currentGame.reviewCount}
          />
        </div>
      </div>
    </div>
  );
}
