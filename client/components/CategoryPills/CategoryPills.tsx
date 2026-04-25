'use client';

import { useRef } from 'react';
import { useCategories } from '@/hooks/useGames';
import styles from './CategoryPills.module.css';

interface CategoryPillsProps {
  active: string;
  onSelect: (cat: string) => void;
}

const STATIC = [
  { name: 'All Games', slug: 'all', icon: 'grid_view' },
  { name: 'Popular', slug: 'popular', icon: 'local_fire_department' },
  { name: 'New', slug: 'new', icon: 'fiber_new' },
];

export default function CategoryPills({ active, onSelect }: CategoryPillsProps) {
  const { categories, isLoading } = useCategories();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => trackRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => trackRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  return (
    <div className={styles.wrapper}>
      <div className={styles.trackContainer}>
        <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={scrollLeft} aria-label="Scroll left">
          <span className="material-icons-round">chevron_left</span>
        </button>

        <div className={styles.track} ref={trackRef}>
          {STATIC.map((s) => (
            <button
              key={s.slug}
              className={`${styles.pill} ${active === s.slug ? styles.active : ''}`}
              onClick={() => onSelect(s.slug)}
            >
              <span className={`material-icons-round ${styles.pillIcon}`}>{s.icon}</span>
              {s.name}
            </button>
          ))}

          {!isLoading &&
            categories?.map((cat) => (
              <button
                key={cat.slug}
                className={`${styles.pill} ${active === cat.slug ? styles.active : ''}`}
                onClick={() => onSelect(cat.slug)}
              >
                <span className={`material-icons-round ${styles.pillIcon}`}>{cat.icon}</span>
                {cat.name}
              </button>
            ))}

          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonPill} />
            ))}
        </div>

        <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={scrollRight} aria-label="Scroll right">
          <span className="material-icons-round">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
