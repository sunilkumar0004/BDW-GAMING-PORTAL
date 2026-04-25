import styles from './LoadingSkeleton.module.css';

export default function LoadingSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.04}s` }}>
          <div className={styles.imageArea} />
          <div className={styles.info}>
            <div className={styles.line} style={{ width: '55%', height: '10px' }} />
            <div className={styles.line} style={{ width: '80%', height: '14px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
