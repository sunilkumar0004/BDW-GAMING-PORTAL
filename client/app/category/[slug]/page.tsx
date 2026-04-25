'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCategories } from '@/hooks/useGames';
import Topbar from '@/components/Topbar/Topbar';
import CategoryPills from '@/components/CategoryPills/CategoryPills';
import GameGrid from '@/components/GameGrid/GameGrid';
import { useSearch } from '@/hooks/useSearch';
import styles from './category.module.css';

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const { categories } = useCategories();
  const { query, debouncedQuery, handleSearch } = useSearch(350);
  const [activeCategory, setActiveCategory] = useState(slug);

  // Find original category name from slug
  const cat = categories?.find((c) => c.slug === activeCategory);
  const categoryName = cat?.name || activeCategory;

  return (
    <div className={styles.page}>
      <Topbar searchQuery={query} onSearch={handleSearch} />
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <span className={`material-icons-round ${styles.pageIcon}`}>
            {cat?.icon || 'gamepad'}
          </span>
          <h1 className={styles.pageTitle}>{categoryName}</h1>
        </div>
        <CategoryPills active={activeCategory} onSelect={setActiveCategory} />
        <GameGrid category={activeCategory} search={debouncedQuery} />
      </div>
    </div>
  );
}
