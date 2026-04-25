'use client';

import { useState } from 'react';
import Topbar from '@/components/Topbar/Topbar';
import FeaturedBanner from '@/components/FeaturedBanner/FeaturedBanner';
import PCGamesSection from '@/components/PCGamesSection/PCGamesSection';
import TrendingSection from '@/components/TrendingSection/TrendingSection';
import CategoryPills from '@/components/CategoryPills/CategoryPills';
import GameGrid from '@/components/GameGrid/GameGrid';
import { useSearch } from '@/hooks/useSearch';
import styles from './page.module.css';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { query, debouncedQuery, handleSearch } = useSearch(350);

  return (
    <div className={styles.page}>
      <Topbar searchQuery={query} onSearch={handleSearch} />
      <div className={styles.content}>
        <FeaturedBanner />
        <PCGamesSection />
        <TrendingSection />
        <CategoryPills active={activeCategory} onSelect={setActiveCategory} />
        <GameGrid category={activeCategory} search={debouncedQuery} />
      </div>
    </div>
  );
}
