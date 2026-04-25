'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useGames, useFeaturedGames } from '@/hooks/useGames';
import { Game } from '@/types/game';
import GamePlayer from '@/components/GamePlayer/GamePlayer';
import GameDetailModal from '@/components/GameDetailModal/GameDetailModal';
import styles from './FeaturedBanner.module.css';

const PLATFORM_MAP: Record<string, string> = {
  pc: 'computer',
  ps5: 'sports_esports',
  xbox: 'sports_esports',
  mobile: 'smartphone',
  browser: 'language'
};

export default function FeaturedBanner() {
  const { games } = useFeaturedGames();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featured = games?.filter((g) => g.isFeatured && g.trailer).slice(0, 10) || [];

  const goToSlide = (idx: number) => {
    if (idx === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setIsTransitioning(false);
    }, 250);
  };

  useEffect(() => {
    if (featured.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % featured.length);
    }, 5500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [featured.length]);

  if (!featured.length) return <div className={styles.skeleton} />;

  const active = featured[activeIndex];
  const isBrowser = !active.type || active.type === 'browser';

  return (
    <>
      <section className={styles.banner}>
        {/* Animated grid background */}
        <div className={styles.gridOverlay} />
        
        {/* Slide */}
        <div className={`${styles.slide} ${isTransitioning ? styles.slideOut : styles.slideIn}`} key={active.id}>
          {active.image && (
            <Image 
              src={active.image} 
              alt={active.title} 
              fill
              priority
              className={styles.bgImage}
              unoptimized={true}
            />
          )}
          <div className={styles.gradientOverlay} />
          <div className={styles.neonTop} />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.contentInner}>
            <div className={styles.tagRow}>
              <span className={styles.liveChip}>
                <span className={styles.liveDot}></span>
                FEATURED
              </span>
              <span className={styles.categoryChip}>{active.category}</span>
              {active.isNew && <span className={styles.newChip}>NEW</span>}
              
              {/* Platform Chips */}
              {active.platforms && active.platforms.map((p: string) => (
                <span key={p} className={styles.platformChip} title={p}>
                  <span className="material-icons-round">{PLATFORM_MAP[p] || 'gamepad'}</span>
                  {p.toUpperCase()}
                </span>
              ))}
            </div>
            
            <h1 className={styles.title}>{active.title}</h1>
            
            {active.description && (
              <p className={styles.desc}>
                {active.description.slice(0, 160)}{active.description.length > 160 ? '…' : ''}
              </p>
            )}

            <div className={styles.metaRow}>
              {active.rating && (
                <div className={styles.ratingRow}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`material-icons-round ${styles.star}`}
                      style={{ color: s <= Math.round(active.rating!) ? '#FFD700' : 'rgba(255,255,255,0.2)' }}>
                      star
                    </span>
                  ))}
                  <span className={styles.ratingNum}>{active.rating?.toFixed(1)}</span>
                </div>
              )}
              {active.downloads && (
                <div className={styles.downloadBadge}>
                  <span className="material-icons-round">download</span>
                  {active.downloads}
                </div>
              )}
            </div>

            <div className={styles.btnRow}>
              <button
                className={styles.playBtn}
                onClick={() => setSelectedGame(active)}
              >
                <span className="material-icons-round">{isBrowser ? 'play_arrow' : 'download'}</span>
                {isBrowser ? 'Play Now' : 'Get PC Version'}
              </button>
              <button className={styles.infoBtn} onClick={() => setSelectedGame(active)}>
                <span className="material-icons-round">info</span>
              </button>
            </div>
          </div>
        </div>

        {/* Film strip thumbnails on right */}
        <div className={styles.filmStrip}>
          {featured.map((g, i) => (
            <button
              key={g.id}
              className={`${styles.filmFrame} ${i === activeIndex ? styles.filmActive : ''}`}
              onClick={() => goToSlide(i)}
            >
              <div className={styles.filmImgWrapper}>
                <Image src={g.image} alt={g.title} fill sizes="100px" unoptimized={true} />
              </div>
              <div className={styles.filmLabel}>{g.title.slice(0, 14)}</div>
              {i === activeIndex && <div className={styles.filmBorder} />}
            </button>
          ))}
        </div>

        {/* Dots nav */}
        <div className={styles.dots}>
          {featured.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      </section>

      {selectedGame && isBrowser && (
        <GamePlayer game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
      {selectedGame && !isBrowser && (
        <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </>
  );
}
