'use client';

import { useEffect } from 'react';
import { Game } from '@/types/game';
import ReviewSection from '@/components/ReviewSection/ReviewSection';
import styles from './GameDetailModal.module.css';

interface Props {
  game: Game;
  onClose: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= Math.floor(rating)) return <span key={i} className={`material-icons-round ${styles.starFull}`}>star</span>;
        if (i === Math.ceil(rating) && rating % 1 >= 0.3) return <span key={i} className={`material-icons-round ${styles.starHalf}`}>star_half</span>;
        return <span key={i} className={`material-icons-round ${styles.starEmpty}`}>star_outline</span>;
      })}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  );
}

const PLATFORM_MAP: Record<string, { icon: string; label: string; color: string }> = {
  mobile:  { icon: 'smartphone', label: 'Mobile',   color: '#34c759' },
  pc:      { icon: 'computer',   label: 'PC',        color: '#0a84ff' },
  browser: { icon: 'language',   label: 'Browser',   color: '#ff9500' },
  ps5:     { icon: 'sports_esports', label: 'PS5',  color: '#003791' },
  xbox:    { icon: 'sports_esports', label: 'Xbox', color: '#107c10' },
};

export default function GameDetailModal({ game, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <span className="material-icons-round">close</span>
        </button>

        <div className={styles.body}>
          {/* ── Left: Media ─────────────────────────── */}
          <div className={styles.mediaCol}>
            {game.trailer ? (
              <div className={styles.trailerBox}>
                <iframe
                  src={`https://www.youtube.com/embed/${game.trailer}?autoplay=1&mute=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
                  title={`${game.title} Trailer`}
                  className={styles.trailer}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className={styles.heroImgBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.image} alt={game.title} className={styles.heroImg}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/600x340/16162a/8B8BAA?text=${encodeURIComponent(game.title)}`; }}
                />
              </div>
            )}

            {/* Screenshots strip */}
            {game.screenshots && game.screenshots.length > 0 && (
              <div className={styles.screenshots}>
                {game.screenshots.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={`Screenshot ${i + 1}`} className={styles.shot}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ))}
              </div>
            )}

            {/* Tech tags */}
            {game.tags && (
              <div className={styles.tags}>
                {game.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
            )}
          </div>

          {/* ── Right: Info ─────────────────────────── */}
          <div className={styles.infoCol}>
            <span className={styles.categoryChip}>{game.category}</span>
            <h2 className={styles.gameTitle}>{game.title}</h2>

            {game.rating !== undefined && <StarRating rating={game.rating} />}

            {/* Meta grid */}
            <div className={styles.meta}>
              {game.developer && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}><span className="material-icons-round">business</span>Developer</span>
                  <span className={styles.metaVal}>{game.developer}</span>
                </div>
              )}
              {game.released && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}><span className="material-icons-round">calendar_today</span>Released</span>
                  <span className={styles.metaVal}>{game.released}</span>
                </div>
              )}
              {game.downloads && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}><span className="material-icons-round">download</span>Downloads</span>
                  <span className={styles.metaVal}>{game.downloads}</span>
                </div>
              )}
              {game.size && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}><span className="material-icons-round">storage</span>Size</span>
                  <span className={styles.metaVal}>{game.size}</span>
                </div>
              )}
              {game.players && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}><span className="material-icons-round">groups</span>Players</span>
                  <span className={`${styles.metaVal} ${styles.metaAccent}`}>{game.players}</span>
                </div>
              )}
            </div>

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className={styles.platforms}>
                {game.platforms.map((p) => {
                  const info = PLATFORM_MAP[p] || { icon: 'gamepad', label: p, color: '#aaa' };
                  return (
                    <span key={p} className={styles.platformPill} style={{ '--pill-color': info.color } as React.CSSProperties}>
                      <span className="material-icons-round">{info.icon}</span>
                      {info.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Description */}
            {game.description && (
              <p className={styles.desc}>{game.description}</p>
            )}

            {/* Download / Play buttons */}
            <div className={styles.actions}>
              {game.type === 'browser' ? (
                <a href={game.url} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnPrimary}`}>
                  <span className="material-icons-round">play_arrow</span>Play Now in Browser
                </a>
              ) : (
                <>
                  {game.downloadLinks?.playStore && (
                    <a href={game.downloadLinks.playStore} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnAndroid}`}>
                      <span className="material-icons-round">android</span>Play Store
                    </a>
                  )}
                  {game.downloadLinks?.appStore && (
                    <a href={game.downloadLinks.appStore} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnIos}`}>
                      <span className="material-icons-round">phone_iphone</span>App Store
                    </a>
                  )}
                  {game.downloadLinks?.steam && (
                    <a href={game.downloadLinks.steam} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnSteam}`}>
                      <span className="material-icons-round">cloud_download</span>Steam
                    </a>
                  )}
                  {game.downloadLinks?.epicGames && (
                    <a href={game.downloadLinks.epicGames} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnEpic}`}>
                      <span className="material-icons-round">sports_esports</span>Epic Games
                    </a>
                  )}
                  {game.downloadLinks?.pc && !game.downloadLinks.steam && !game.downloadLinks.epicGames && (
                    <a href={game.downloadLinks.pc} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnPc}`}>
                      <span className="material-icons-round">computer</span>Download for PC
                    </a>
                  )}
                  {!game.downloadLinks?.playStore && !game.downloadLinks?.appStore && !game.downloadLinks?.steam && !game.downloadLinks?.epicGames && !game.downloadLinks?.pc && (
                    <a href={game.url} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnPrimary}`}>
                      <span className="material-icons-round">open_in_new</span>Official Website
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsWrapper}>
          <ReviewSection 
            gameId={game.id} 
            initialRating={game.rating} 
                       initialReviewCount={(game as any).reviewCount}
          />
        </div>
      </div>
    </div>
  );
}
