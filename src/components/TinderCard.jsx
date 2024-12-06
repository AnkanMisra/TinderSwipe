import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

function TinderCard({
  card,
  onSwiped,
  swipeThreshold,
  cardWidth,
  cardHeight,
  matchLabel,
  noLabel,
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);

  const showMatchLabel = x.get() > 50;
  const showNoLabel = x.get() < -50;

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    if (offset > swipeThreshold) {
      // Swiped Right
      onSwiped('right', card.id);
    } else if (offset < -swipeThreshold) {
      // Swiped Left
      onSwiped('left', card.id);
    } else {
      // Snap back to center
      // framer-motion handles this automatically if we revert to initial
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        backgroundColor: card.color,
        borderRadius: '10px',
        top: 0,
        left: 0,
        x,
        rotate,
        cursor: 'grab',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      role="article"
      aria-label={`Swipeable card: ${card.text}`}
    >
      {showMatchLabel && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: '#0f0',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          {matchLabel}
        </div>
      )}
      {showNoLabel && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            color: '#f00',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          {noLabel}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontSize: '2rem',
          userSelect: 'none',
        }}
      >
        {card.text}
      </div>
    </motion.div>
  );
}

export default TinderCard;