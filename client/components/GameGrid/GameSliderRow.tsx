import { useRef } from 'react';
import { Game } from '@/types/game';
import GameCard from '@/components/GameCard/GameCard';
import styles from './GameSliderRow.module.css';

interface GameSliderRowProps {
  title: string;
  games: Game[];
}

export default function GameSliderRow({ title, games }: GameSliderRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Show all games in the row to satisfy the request for the full catalog
  const visibleGames = games;

  if (!visibleGames.length) return null;

  const scrollLeft = () => trackRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  const scrollRight = () => trackRef.current?.scrollBy({ left: 400, behavior: 'smooth' });

  return (
    <div className={styles.wrapper}>
      <div className={styles.rowHeader}>
        <h3 className={styles.title}>{title}</h3>
        <a href={`/category/${title.toLowerCase().replace(/\s+/g, '-')}`} className={styles.seeAll}>
          See All <span className="material-icons-round">chevron_right</span>
        </a>
      </div>
      <div className={styles.trackContainer}>
        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={scrollLeft} aria-label="Scroll left">
          <span className="material-icons-round">chevron_left</span>
        </button>
        
        <div className={styles.track} ref={trackRef}>
          {visibleGames.map((game) => (
            <div key={game.id} className={styles.slideItem}>
              <GameCard game={game} />
            </div>
          ))}
        </div>

        <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={scrollRight} aria-label="Scroll right">
          <span className="material-icons-round">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
