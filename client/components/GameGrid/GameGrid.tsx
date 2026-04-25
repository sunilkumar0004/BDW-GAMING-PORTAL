'use client';

import { useState } from 'react';
import { useGames } from '@/hooks/useGames';
import GameCard from '@/components/GameCard/GameCard';
import LoadingSkeleton from '@/components/LoadingSkeleton/LoadingSkeleton';
import styles from './GameGrid.module.css';

interface GameGridProps {
  category?: string;
  search?: string;
  ids?: string;
}

import GameSliderRow from './GameSliderRow';

export default function GameGrid({ category = 'all', search = '', ids }: GameGridProps) {
  const [page, setPage] = useState(1);
  // 60 per page for category/search views; unlimited fetch for slider homepage
  const showSliderRows = (category === 'all' || category === 'popular' || category === 'new') && !search && !ids;
  const limit = showSliderRows ? 3000 : 100;

  // Resolve category for API (popular/new = 'all' from server pov, just sort-label)
  const apiCategory =
    category === 'all' || category === 'popular' || category === 'new'
      ? undefined
      : category;

  const { data, isLoading, error } = useGames({
    page,
    limit,
    category: apiCategory,
    search: search || undefined,
    ids
  });

  if (error) {
    return (
      <div className={styles.error}>
        <span className="material-icons-round">error_outline</span>
        <p>Could not load games. Make sure the server is running on port 3001.</p>
        <button className={styles.retryBtn} onClick={() => setPage(1)}>
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton count={20} />;

  const games = data?.games || [];

  if (!games.length) {
    return (
      <div className={styles.empty}>
        <span className="material-icons-round">search_off</span>
        <p>No games found{search ? ` for "${search}"` : ''}.</p>
      </div>
    );
  }

  // Already computed above, no need to recompute

  let groupedGames: Record<string, typeof games> = {};
  if (showSliderRows) {
    // Group games by category
    games.forEach((g) => {
      if (!groupedGames[g.category]) groupedGames[g.category] = [];
      groupedGames[g.category].push(g);
    });
    // Sort groups dynamically by count
    groupedGames = Object.fromEntries(
      Object.entries(groupedGames).sort((a, b) => b[1].length - a[1].length)
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          {search
            ? `Results for "${search}"`
            : category === 'all'
            ? 'All Games'
            : category === 'popular'
            ? '🔥 Popular Games'
            : category === 'new'
            ? '✨ New Games'
            : category}
        </h2>
        <span className={styles.count}>{data?.total || 0} games</span>
      </div>

      {showSliderRows ? (
        <div className={styles.sliderRowsWrapper}>
          {Object.entries(groupedGames).map(([catName, catGames]) => (
            <GameSliderRow key={catName} title={catName} games={catGames} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && !showSliderRows && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <span className="material-icons-round">chevron_left</span>
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {data.totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
