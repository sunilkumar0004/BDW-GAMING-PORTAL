'use client';

import { useState, useRef } from 'react';
import { useGames } from '@/hooks/useGames';
import { Game } from '@/types/game';
import GameDetailModal from '@/components/GameDetailModal/GameDetailModal';
import GamePlayer from '@/components/GamePlayer/GamePlayer';
import styles from './TrendingSection.module.css';

const TRENDING_IDS = [
  'free-fire', 'bgmi', 'cod-mobile', 'fortnite', 'genshin-impact',
  'pubg-mobile', 'brawl-stars', 'valorant', 'clash-of-clans', 'stumble-guys',
];

export default function TrendingSection() {
  const { data } = useGames({ limit: 200 });
  const [selected, setSelected] = useState<Game | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Pull custom games (trending IDs) + fill with first API games
  // Pull games with trailers that are either in TRENDING_IDS or marked as featured
  const trending = data?.games
    .filter((g) => g.trailer && (TRENDING_IDS.includes(g.id) || g.isFeatured))
    .slice(0, 12) || [];

  if (!trending.length) return null;

  const isBrowser = (g: Game) => !g.type || g.type === 'browser';

  const scrollLeft = () => trackRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => trackRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  return (
    <>
      <section className={styles.section}>
        <div className={styles.header}>
          <span className={`material-icons-round ${styles.fireIcon}`}>local_fire_department</span>
          <h2 className={styles.title}>Trending Now</h2>
          <span className={styles.badge}>HOT</span>
        </div>

        <div className={styles.trackContainer}>
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={scrollLeft} aria-label="Scroll left">
            <span className="material-icons-round">chevron_left</span>
          </button>

          <div className={styles.track} ref={trackRef}>
            {trending.map((game, i) => (
              <button
                key={game.id}
                className={styles.card}
                onClick={() => setSelected(game)}
                style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
              >
                {/* Background image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.image}
                  alt={game.title}
                  className={styles.bg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://placehold.co/280x160/16162a/8B8BAA?text=${encodeURIComponent(game.title.slice(0, 10))}`;
                  }}
                />
                <div className={styles.cardOverlay} />

                {/* Rank */}
                <span className={styles.rank}>#{i + 1}</span>

                {/* Platform badge */}
                {game.type && game.type !== 'browser' && (
                  <span className={`${styles.typePill} ${game.type === 'mobile' ? styles.mobilePill : styles.pcPill}`}>
                    <span className="material-icons-round">{game.type === 'mobile' ? 'smartphone' : 'computer'}</span>
                    {game.type === 'mobile' ? 'Mobile' : 'PC'}
                  </span>
                )}

                <div className={styles.cardInfo}>
                  {game.rating && (
                    <div className={styles.stars}>
                      <span className="material-icons-round">star</span>
                      {game.rating.toFixed(1)}
                    </div>
                  )}
                  <p className={styles.cardTitle}>{game.title}</p>
                  <p className={styles.cardCat}>{game.category}</p>
                </div>

                {/* Play overlay */}
                <div className={styles.playOverlay}>
                  <div className={styles.playBtn}>
                    <span className="material-icons-round">
                      {isBrowser(game) ? 'play_arrow' : 'info'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={scrollRight} aria-label="Scroll right">
            <span className="material-icons-round">chevron_right</span>
          </button>
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
