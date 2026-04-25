'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCategories } from '@/hooks/useGames';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'New Games', icon: 'fiber_new', href: '/?filter=new' },
  { label: 'Popular', icon: 'local_fire_department', href: '/?filter=popular' },
  { label: 'Saved Games', icon: 'favorite', href: '/saved-games' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { categories, isLoading } = useCategories();
  const { openFeedbackModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        <span className="material-icons-round">menu</span>
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoImgWrapper}>
            <Image
              src="/bdw-logo.png"
              alt="BDW Gaming Portal"
              width={48}
              height={48}
              className={styles.logoImg}
              priority
            />
          </div>
          <div className={styles.logoTextBlock}>
            <span className={styles.logoTextBDW}>BDW</span>
            <span className={styles.logoTextSub}>Gaming Portal</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${
                  pathname === item.href.split('?')[0] ? styles.active : ''
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={`material-icons-round ${styles.navIcon}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div className={styles.navSection}>
            <p className={styles.sectionTitle}>Categories</p>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeletonItem} />
                ))
              : categories?.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className={`${styles.navItem} ${
                      pathname === `/category/${cat.slug}` ? styles.active : ''
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className={`material-icons-round ${styles.navIcon}`}>
                      {cat.icon}
                    </span>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.catCount}>{cat.count}</span>
                  </Link>
                ))}
          </div>
        </nav>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <p>© 2026 BDW Gaming Portal</p>
          <div className={styles.signature}>
            Developed by <span className={styles.skayText}>SKAY</span>
          </div>
        </div>
      </aside>
    </>
  );
}
