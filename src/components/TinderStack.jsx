import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import correctIcon from '../assets/images/correct.png';
import wrongIcon from '../assets/images/wrong.png';

const COLORS = ['#FF6B6B', '#6BCBFF', '#B6FF6B', '#FFD700', '#FF8C00', '#ADFF2F'];

function getRandomCard(id) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { id, color, text: `Card ${id}` };
}

function TinderStack({ swipeThreshold = 100, visibleCount = 3 }) {
  const [cards, setCards] = useState(() => {
    const initial = [];
    for (let i = 1; i <= 10; i++) {
      initial.push(getRandomCard(i));
    }
    return initial;
  });
  const [currentId, setCurrentId] = useState(11);
  const [exitingCard, setExitingCard] = useState(null);
  const [exitingDirection, setExitingDirection] = useState(null);

  useEffect(() => {
    if (cards.length < visibleCount) {
      addNewCard();
    }
  }, [cards, visibleCount]);

  const addNewCard = () => {
    setCards((prev) => [...prev, getRandomCard(currentId)]);
    setCurrentId((prev) => prev + 1);
  };

  const handleCardSwipe = (direction) => {
    const topCard = cards[0];
    setExitingCard(topCard);
    setExitingDirection(direction);
    setCards((prev) => prev.slice(1));
    addNewCard();
  };

  const handleExitAnimationComplete = () => {
    setExitingCard(null);
    setExitingDirection(null);
  };

  function VisibleCard({ card, index }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);

    const handleDragEnd = (event, info) => {
      const offset = info.offset.x;
      if (offset > swipeThreshold) {
        handleCardSwipe('right');
      } else if (offset < -swipeThreshold) {
        handleCardSwipe('left');
      } else {
        x.set(0);
      }
    };

    const stackZIndex = visibleCount - index;
    const yOffset = index * 20; // Each subsequent card is moved 20px further down

    let animateProps = { x: 0, y: yOffset, scale: 1, rotate: 0, opacity: 1 };
    if (index === 0 && exitingDirection === 'right') {
      animateProps = { x: 1000, y: yOffset, scale: 1, rotate: 0, opacity: 0 };
    } else if (index === 0 && exitingDirection === 'left') {
      animateProps = { x: -1000, y: yOffset, scale: 1, rotate: 0, opacity: 0 };
    }

    return (
      <motion.div
        drag={index === 0 && !exitingCard ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ x: 0, y: yOffset, scale: 1, rotate: 0, opacity: 1 }}
        animate={animateProps}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        onAnimationComplete={() => {
          if (index === 0 && exitingDirection) {
            handleExitAnimationComplete();
          }
        }}
        style={{ x, rotate, backgroundColor: card.color, zIndex: stackZIndex }}
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl flex items-center justify-center text-white text-2xl select-none cursor-grab"
      >
        {card.text}

        {/* Conditional rendering for swipe indicators */}
        {exitingDirection === 'left' && (
          <img
            src={wrongIcon}
            alt="Wrong"
            className="absolute top-4 left-4 w-12 h-12"
          />
        )}

        {exitingDirection === 'right' && (
          <img
            src={correctIcon}
            alt="Correct"
            className="absolute top-4 right-4 w-12 h-12"
          />
        )}
      </motion.div>
    );
  }

  function ExitingCard({ card, direction }) {
    const exitX = direction === 'right' ? 1000 : -1000;
    const exitRotate = direction === 'right' ? 15 : -15;

    return (
      <motion.div
        className="absolute top-0 left-0 w-[300px] h-[400px] rounded-xl border border-black shadow-xl flex items-center justify-center text-white text-2xl select-none"
        style={{ backgroundColor: card.color, zIndex: visibleCount + 1 }}
        initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
        animate={{ x: exitX, y: 0, scale: 1, rotate: exitRotate, opacity: 0 }}
        transition={{ duration: 1.0, ease: 'easeInOut' }}
        onAnimationComplete={handleExitAnimationComplete}
      >
        {card.text}
      </motion.div>
    );
  }

  const visibleCards = cards.slice(0, visibleCount);

  return (
    <div className="relative w-[300px] h-[400px] mx-auto overflow-visible">
      {visibleCards.map((card, i) => (
        <VisibleCard key={card.id} card={card} index={i} />
      ))}
      {exitingCard && (
        <ExitingCard card={exitingCard} direction={exitingDirection} />
      )}
    </div>
  );
}

export default TinderStack;