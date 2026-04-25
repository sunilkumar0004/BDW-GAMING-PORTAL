'use client';

import { useState, useRef } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types/game';
import GameDetailModal from '@/components/GameDetailModal/GameDetailModal';
import GamePlayer from '@/components/GamePlayer/GamePlayer';
import styles from './PCGamesSection.module.css';

export default function PCGamesSection() {
  // Fetch specifically download/pc games using server-side filtering
  const { data } = useGames({ type: 'download', limit: 20 });
  const [selected, setSelected] = useState<Game | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const pcGames = data?.games || [];

  if (!pcGames.length) return null;

  const isBrowser = (g: Game) => !g.type || g.type === 'browser';

  const scrollLeft = () => trackRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => trackRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  return (
    <>
      <section className={styles.section}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={`material-icons-round ${styles.pcIcon}`}>computer</span>
            <h2 className={styles.title}>Premium PC Games</h2>
            <span className={styles.countBadge}>{pcGames.length} Available</span>
          </div>
          <div className={styles.navGroup}>
            <button className={styles.navBtn} onClick={scrollLeft} aria-label="Scroll left">
              <span className="material-icons-round">chevron_left</span>
            </button>
            <button className={styles.navBtn} onClick={scrollRight} aria-label="Scroll right">
              <span className="material-icons-round">chevron_right</span>
            </button>
          </div>
        </div>

        <div className={styles.trackContainer}>
          <div className={styles.track} ref={trackRef}>
            {pcGames.map((game, i) => (
              <button
                key={game.id}
                className={styles.card}
                onClick={() => setSelected(game)}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={game.image}
                    alt={game.title}
                    className={styles.bg}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/280x360/16162a/8B8BAA?text=${encodeURIComponent(game.title)}`;
                    }}
                  />
                  <div className={styles.cardOverlay} />
                  
                  {/* Rating Badge */}
                  {game.rating && (
                    <div className={styles.ratingBadge}>
                      <span className="material-icons-round">star</span>
                      {game.rating.toFixed(1)}
                    </div>
                  )}

                  {/* Platforms */}
                  {game.platforms && (
                    <div className={styles.platforms}>
                      {game.platforms.slice(0, 3).map(p => (
                        <span key={p} className="material-icons-round" title={p}>
                          {p === 'pc' ? 'computer' : p === 'mobile' ? 'smartphone' : 'sports_esports'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.cardInfo}>
                  <p className={styles.cardCat}>{game.category}</p>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <div className={styles.downloadInfo}>
                    <span className="material-icons-round">download</span>
                    {game.downloads || '1M+'}
                  </div>
                </div>

                {/* Hover Play Button */}
                <div className={styles.playOverlay}>
                  <div className={styles.playBtn}>
                    <span className="material-icons-round">download_for_offline</span>
                    <span>View Details</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selected && isBrowser(selected) && (
        <GamePlayer game={selected} onClose={() => setSelected(null)} />
      )}
      {selected && !isBrowser(selected) && (
        <GameDetailModal game={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
