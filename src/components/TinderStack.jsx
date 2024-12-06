import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import correctIcon from '../assets/images/correct.png';
import wrongIcon from '../assets/images/wrong.png';

const COLORS = [
  '#FF6B6B', '#6BCBFF', '#B6FF6B', '#FFD700',
  '#FF8C00', '#ADFF2F', '#9370DB', '#40E0D0'
];

function createRandomCard(id) {
  const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { id, color: randomColor };
}

function TinderStack({
  swipeThreshold = 150,
  visibleCount = 4,
  onSwipe = () => {},
  cardWidth = 300,
  cardHeight = 450
}) {
  const [cards, setCards] = useState(() =>
    Array.from({ length: 10 }, (_, i) => createRandomCard(i + 1))
  );
  const [nextCardId, setNextCardId] = useState(11);
  const [activeSwipe, setActiveSwipe] = useState(null);

  const addCard = useCallback(() => {
    setCards(prev => [...prev, createRandomCard(nextCardId)]);
    setNextCardId(prev => prev + 1);
  }, [nextCardId]);

  useEffect(() => {
    if (cards.length < visibleCount) {
      addCard();
    }
  }, [cards, visibleCount, addCard]);

  const determineDirection = (offsetX, offsetY) => {
    const angle = Math.atan2(offsetY, offsetX) * (180 / Math.PI);
    if (angle > 45 && angle <= 135) return 'down';
    if (angle < -45 && angle >= -135) return 'up';
    if (offsetX < 0) return 'left';
    return 'right';
  };

  const TinderCard = React.memo(({ card, index, totalVisible }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-cardWidth, 0, cardWidth], [-20, 0, 20]);
    const scale = useTransform(x, [-cardWidth, 0, cardWidth], [0.95, 1, 0.95]);
    const stackOffset = index * 20;
    const backScale = 1 - index * 0.05;

    const handleDragEnd = (_, info) => {
      const { offset } = info;
      const distanceMoved = Math.sqrt(offset.x ** 2 + offset.y ** 2);
      if (distanceMoved > swipeThreshold) {
        const direction = determineDirection(offset.x, offset.y);
        setActiveSwipe({ direction, card });
        onSwipe(direction);
        setTimeout(() => {
          setCards(prev => prev.slice(1));
          addCard();
          setActiveSwipe(null);
        }, 300);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const showWrongIcon = x.get() < -50;
    const showCorrectIcon = x.get() > 50;

    return (
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{
          position: 'absolute',
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          borderRadius: '16px',
          backgroundColor: card.color,
          top: stackOffset,
          left: 0,
          boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
          cursor: 'grab',
          x,
          y,
          rotate,
          scale,
          zIndex: totalVisible - index,
          border: '2px solid black'
        }}
        initial={{ 
          scale: backScale,
          y: stackOffset
        }}
        animate={{ 
          scale: backScale,
          y: stackOffset
        }}
        transition={{ 
          type: 'spring',
          stiffness: 200,
          damping: 25
        }}
      >
        {showWrongIcon && (
          <img
            src={wrongIcon}
            alt=""
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: '40px',
              height: '40px'
            }}
          />
        )}
        {showCorrectIcon && (
          <img
            src={correctIcon}
            alt=""
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '40px',
              height: '40px'
            }}
          />
        )}
      </motion.div>
    );
  });

  const ExitCard = activeSwipe ? (
    <motion.div
      key="exit-card"
      initial={{ x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{ 
        x: activeSwipe.direction === 'right' ? cardWidth * 2 
          : activeSwipe.direction === 'left' ? -cardWidth * 2 
          : activeSwipe.direction === 'down' ? 0 
          : activeSwipe.direction === 'up' ? 0 
          : 0,
        y: activeSwipe.direction === 'down' ? cardHeight * 2 
          : activeSwipe.direction === 'up' ? -cardHeight * 2 
          : 0,
        rotate: activeSwipe.direction === 'right' ? 30 
          : activeSwipe.direction === 'left' ? -30 
          : 0,
        scale: 0.7,
        opacity: 0
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 40
      }}
      style={{
        position: 'absolute',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        borderRadius: '16px',
        backgroundColor: activeSwipe.card.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: visibleCount + 1,
        border: '2px solid black'
      }}
    />
  ) : null;

  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

  return (
    <div
      style={{
        position: 'relative',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        margin: '0 auto',
        perspective: '1000px'
      }}
    >
      <AnimatePresence>
        {[...visibleCards].reverse().map((card, i) => {
          const reversedIndex = visibleCount - i - 1;
          return (
            <TinderCard 
              key={card.id} 
              card={card} 
              index={reversedIndex} 
              totalVisible={visibleCount}
            />
          );
        })}
        {ExitCard}
      </AnimatePresence>
    </div>
  );
}

export default TinderStack;