'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Topbar.module.css';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from '@/components/ProfileDropdown/ProfileDropdown';

interface TopbarProps {
  searchQuery: string;
  onSearch: (v: string) => void;
}

export default function Topbar({ searchQuery, onSearch }: TopbarProps) {
  const { user, isLoggedIn, openAuthModal, openFeedbackModal } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [siteRating, setSiteRating] = useState(5.0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSiteRating = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${baseUrl}/api/games/WEBSITE_FEEDBACK`);
        if (res.ok) {
          const data = await res.json();
          if (data.game) {
            setSiteRating(data.game.rating || 5.0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch site rating:', err);
      }
    };
    fetchSiteRating();
    // Refresh every minute
    const interval = setInterval(fetchSiteRating, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.searchWrapper}>
        <span className={`material-icons-round ${styles.searchIcon}`}>search</span>
        <input
          id="search-input"
          type="text"
          className={styles.searchInput}
          placeholder="Search BDW Gaming Portal..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            className={styles.clearBtn}
            onClick={() => onSearch('')}
            aria-label="Clear search"
          >
            <span className="material-icons-round">close</span>
          </button>
        )}
      </div>

      <div className={styles.actions} ref={dropdownRef}>
        {/* Site Rating Section */}
        <button className={styles.ratingSection} onClick={openFeedbackModal} title="Rate BDW Portal">
          <div className={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span 
                key={s} 
                className="material-icons-round"
                style={{ color: s <= Math.round(siteRating) ? '#FFD700' : 'rgba(255,255,255,0.2)' }}
              >
                star
              </span>
            ))}
            <span className={styles.ratingVal}>{siteRating.toFixed(1)}</span>
          </div>
          <span className={styles.rateLabel}>Site Rating</span>
        </button>

        <button className={styles.iconBtn} aria-label="Notifications">
          <span className="material-icons-round">notifications_none</span>
        </button>
        
        {isLoggedIn && user ? (
          <>
            <div 
              className={styles.userProfile} 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              title="View Profile"
            >
              <img src={user.avatar} alt="Avatar" />
              <span className={styles.userName}>{user.name}</span>
            </div>
            {isProfileOpen && <ProfileDropdown onClose={() => setIsProfileOpen(false)} />}
          </>
        ) : (
          <button className={styles.loginBtn} onClick={openAuthModal}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
