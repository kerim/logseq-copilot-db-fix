import React from 'react';
import styles from './FloatingButton.module.scss';

type FloatingButtonProps = {
  count: number;
  isOpen: boolean;
  onClick: () => void;
  hasGraph: boolean;
};

const FloatingButton = ({ count, isOpen, onClick, hasGraph }: FloatingButtonProps) => {
  // Show alert icon if no graph configured, magnifying glass if 0 results, or count
  const displayContent = !hasGraph ? '⚠️' : (count === 0 ? '🔍' : count);
  const ariaLabel = !hasGraph
    ? 'Logseq: Configuration needed'
    : (count === 0 ? 'Logseq: Search your graph' : `Logseq results: ${count} items`);

  return (
    <div
      className={`${styles.floatingButton} ${isOpen ? styles.active : ''}`}
      onClick={onClick}
      role="button"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span className={styles.resultCount}>{displayContent}</span>
    </div>
  );
};

export default FloatingButton;
