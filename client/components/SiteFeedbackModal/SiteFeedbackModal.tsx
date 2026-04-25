'use client';

import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/hooks/useGames';
import ReviewSection from '@/components/ReviewSection/ReviewSection';
import styles from './SiteFeedbackModal.module.css';

export default function SiteFeedbackModal() {
  const { isFeedbackModalOpen, closeFeedbackModal } = useAuth();
  const { game: siteData } = useGame('WEBSITE_FEEDBACK');

  if (!isFeedbackModalOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeFeedbackModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Rate BDW Gaming Portal</h2>
          <button className={styles.closeBtn} onClick={closeFeedbackModal}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.intro}>
            Please rate your experience with BDW Gaming Portal from 1 to 5 stars and share your feedback below. 
            Your real reviews help us improve!
          </p>
          
          <ReviewSection 
            gameId="WEBSITE_FEEDBACK" 
          />
        </div>
      </div>
    </div>
  );
}
