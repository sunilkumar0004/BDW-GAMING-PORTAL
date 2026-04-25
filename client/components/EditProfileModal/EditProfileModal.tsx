'use client';

import React, { useState, useEffect } from 'react';
import styles from './EditProfileModal.module.css';
import { useAuth } from '@/context/AuthContext';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Samurai',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Ninja',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Princess',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bandit',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyborg',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mech',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Player1',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Mage',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero',
];

export default function EditProfileModal() {
  const { user, updateUser, isEditProfileModalOpen, closeEditProfileModal } = useAuth();
  
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Lock body scroll exactly like AuthModal
  useEffect(() => {
    if (isEditProfileModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isEditProfileModalOpen]);

  // Sync state when modal opens
  useEffect(() => {
    if (user && isEditProfileModalOpen) {
      setName(user.name);
      
      const unbox = [...PRESET_AVATARS, ...(user.unlockedAvatars || [])];
      
      // If the user's current avatar isn't in the list, prepent it
      const currentAvatar = user.avatar;
      if (!unbox.includes(currentAvatar)) {
        unbox.unshift(currentAvatar);
      }
      setSelectedAvatar(currentAvatar);
    }
  }, [user, isEditProfileModalOpen]);

  if (!isEditProfileModalOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateUser({ name, avatar: selectedAvatar });
    closeEditProfileModal();
  };

  const pool = [...PRESET_AVATARS, ...(user.unlockedAvatars || [])];

  return (
    <div className={styles.modalOverlay} onClick={closeEditProfileModal}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={closeEditProfileModal} aria-label="Close">
          <span className="material-icons-round">close</span>
        </button>

        <div className={styles.header}>
          <h2>Customize Profile</h2>
          <p>Choose your gamified alter-ego</p>
        </div>

        <form onSubmit={handleSave} className={styles.formContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="displayName">Display Name</label>
            <input 
              id="displayName"
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. ProGamer99"
              autoComplete="off"
            />
          </div>

          <div className={styles.avatarSection}>
            <label>Select Avatar</label>
            <div className={styles.avatarGrid}>
              {pool.map((avatarUrl, index) => (
                <div 
                  key={index} 
                  className={`${styles.avatarOption} ${selectedAvatar === avatarUrl ? styles.selected : ''}`}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                >
                  <img src={avatarUrl} alt={`Avatar option ${index + 1}`} />
                  {selectedAvatar === avatarUrl && (
                    <div className={styles.checkBadge}>
                      <span className="material-icons-round">check</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {user.unlockedAvatars && user.unlockedAvatars.length > 0 && (
                <p style={{fontSize: 11, color: '#00d2ff', marginTop: 4}}>✨ Mission rewards loaded!</p>
            )}
          </div>

          <button type="submit" className={styles.saveBtn} disabled={!name.trim()}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
