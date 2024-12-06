import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

// Optional direction icons (provide your own images)
import correctIcon from '../assets/images/correct.png';
import wrongIcon from '../assets/images/wrong.png';

// You can add more colors or change them as desired
const COLORS = [
  '#FF6B6B', '#6BCBFF', '#B6FF6B', '#FFD700', 
  '#FF8C00', '#ADFF2F', '#9370DB', '#40E0D0'
];

// Generates a new card with random color and some details
function getRandomCard(id) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { 
    id, 
    color, 
    text: `Card ${id}`,
    details: `This is some interesting detail about Card ${id}`
  };
}

function TinderStack({ 
  swipeThreshold = 150, 
  visibleCount = 3,
  onSwipe = () => {},
  cardWidth = 300,
  cardHeight = 450 
}) {
  const [cards, setCards] = useState(() => 
    Array.from({ length: 10 }, (_, i) => getRandomCard(i + 1))
  );
  const [currentId, setCurrentId] = useState(11);
  const [activeSwipe, setActiveSwipe] = useState(null);

  // Add a new card to the bottom of the stack
  const addNewCard = useCallback(() => {
    setCards(prev => [...prev, getRandomCard(currentId)]);
    setCurrentId(prev => prev + 1);
  }, [currentId]);

  // The top card is the one the user can interact with
  // If cards run low, we add new ones
  useEffect(() => {
    if (cards.length < visibleCount) {
      addNewCard();
    }
  }, [cards, visibleCount, addNewCard]);

  // Determines swipe direction based on drag offset
  const determineDirection = (offsetX, offsetY) => {
    const angle = Math.atan2(offsetY, offsetX) * (180 / Math.PI);
    // Default direction is 'right'
    if (angle > 45 && angle <= 135) return 'down';
    if (angle < -45 && angle >= -135) return 'up';
    if (offsetX < 0) return 'left';
    return 'right';
  };

  // The card component
  const TinderCard = React.memo(({ card, index, totalVisible }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Rotate card slightly as user drags horizontally
    const rotate = useTransform(x, [-cardWidth, 0, cardWidth], [-20, 0, 20]);
    const opacity = useTransform(x, [-cardWidth, 0, cardWidth], [0.5, 1, 0.5]);
    const scale = useTransform(x, [-cardWidth, 0, cardWidth], [0.95, 1, 0.95]);

    const handleDragEnd = (_, info) => {
      const { offset } = info;
      const distanceMoved = Math.sqrt(offset.x ** 2 + offset.y ** 2);

      if (distanceMoved > swipeThreshold) {
        // Determine direction of the swipe
        const direction = determineDirection(offset.x, offset.y);
        setActiveSwipe({ direction, card });
        onSwipe(direction);

        // After a small delay, remove the top card and add a new one
        setTimeout(() => {
          setCards(prev => prev.slice(1));
          addNewCard();
          setActiveSwipe(null);
        }, 300);
      } else {
        // Snap back to center if not swiped far enough
        x.set(0);
        y.set(0);
      }
    };

    // Stacking effect: each subsequent card is moved down and is more transparent
    const stackOffset = index * 20;
    const backScale = 1 - index * 0.05;
    const backOpacity = 1 - index * 0.1;

    // Determine if we should show direction icons
    const showWrong = x.get() < -50;   // swiping left
    const showCorrect = x.get() > 50;  // swiping right
    // You could also add conditions for up/down if you have icons for them.

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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'grab',
          padding: '20px',
          textAlign: 'center',
          x,
          y,
          rotate,
          scale,
          opacity,
          zIndex: totalVisible - index
        }}
        initial={{ 
          scale: backScale,
          y: stackOffset,
          opacity: backOpacity
        }}
        animate={{ 
          scale: backScale,
          y: stackOffset,
          opacity: backOpacity
        }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>
          {card.text}
        </h2>
        <p style={{ fontSize: '1rem', opacity: 0.8 }}>
          {card.details}
        </p>

        {/* Directional icons: show them when user drags beyond certain threshold */}
        {showWrong && (
          <img
            src={wrongIcon}
            alt="Wrong"
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              width: '40px',
              height: '40px'
            }}
          />
        )}
        {showCorrect && (
          <img
            src={correctIcon}
            alt="Correct"
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

  // Exiting card animation uses AnimatePresence
  const ExitCard = activeSwipe ? (
    <motion.div
      key="exit-card"
      initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
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
        stiffness: 400,
        damping: 30
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
        color: '#fff',
        padding: '20px',
        textAlign: 'center',
        zIndex: visibleCount + 1
      }}
    >
      {activeSwipe.card.text}
    </motion.div>
  ) : null;

  // Calculate visible cards
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