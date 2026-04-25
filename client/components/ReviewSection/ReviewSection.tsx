'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './ReviewSection.module.css';

interface Review {
  _id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  gameId: string;
  onReviewSubmitted?: () => void;
  initialRating?: number;
  initialReviewCount?: number;
}

export default function ReviewSection({ gameId, onReviewSubmitted, initialRating = 0, initialReviewCount = 0 }: ReviewSectionProps) {
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/reviews/${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const secret = process.env.NEXT_PUBLIC_API_SECRET || 'dev_secret_key_123';
      
      const res = await fetch(`${baseUrl}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': secret
        },
        body: JSON.stringify({
          gameId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          rating,
          comment
        }),
      });

      if (res.ok) {
        setComment('');
        setRating(5);
        fetchReviews(); // Refresh list
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : initialRating.toFixed(1);

  const displayCount = reviews.length > 0 ? reviews.length : initialReviewCount;

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Share Your Review</h3>

      <form className={styles.reviewForm} onSubmit={handleSubmit}>
        <div className={styles.ratingSelector}>
          <p>Your Rating:</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`material-icons-round ${styles.star} ${s <= rating ? styles.activeStar : ''}`}
                onClick={() => setRating(s)}
              >
                {s <= rating ? 'star' : 'star_border'}
              </span>
            ))}
          </div>
        </div>
        <textarea
          className={styles.textarea}
          placeholder="Share your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          required
        />
        <button className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : isLoggedIn ? 'Post Review' : 'Sign In to Post'}
        </button>
      </form>

      {reviews.length > 0 && (
        <div className={styles.ratingSummary}>
          <div className={styles.avgBlock}>
            <span className={styles.bigRating}>
              {displayRating}
            </span>
            <div className={styles.avgStars}>
              <span className="material-icons-round">star</span>
              <p>{displayCount} Ratings</p>
            </div>
          </div>
          <div className={styles.summaryText}>
            <h3 className={styles.title}>Community Feedback</h3>
            <p>What others are saying</p>
          </div>
        </div>
      )}

      <div className={styles.reviewList}>
        {isLoading ? (
          <p className={styles.loading}>Loading reviews...</p>
        ) : reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r._id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <img src={r.userAvatar} alt={r.userName} className={styles.avatar} />
                <div className={styles.reviewerInfo}>
                  <p className={styles.userName}>{r.userName}</p>
                  <p className={styles.date}>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-icons-round" style={{ fontSize: 14, color: s <= r.rating ? '#FFD700' : '#444' }}>
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className={styles.comment}>{r.comment}</p>
            </div>
          ))
        ) : (
          <p className={styles.noReviews}>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
