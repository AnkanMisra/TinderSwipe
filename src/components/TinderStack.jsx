import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

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
  const [swipeDirection, setSwipeDirection] = useState(null);

  const addNewCard = () => {
    setCards((prev) => [...prev, getRandomCard(currentId)]);
    setCurrentId((prev) => prev + 1);
  };

  const handleSwiped = (direction) => {
    setCards((prev) => prev.slice(1));
    addNewCard();
    setSwipeDirection(null);
    console.log(`Card swiped ${direction}`);
  };

  function TinderCard({ card, index }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);

    // Horizontal stacking:
    // Index 0: no offset
    // Index 1: slightly to the left (-20px)
    // Index 2: even more to the left (-40px)
    // Adjust these values to suit your preferred overlap style.
    const xOffset = index * -30; 
    const scale = 1 - index * 0.05; // slightly scale down cards behind
    const baseOpacity = 1 - index * 0.1; // slightly reduce opacity behind top card

    const handleDragEnd = (event, info) => {
      const offset = info.offset.x;
      if (offset > swipeThreshold) {
        setSwipeDirection('right');
      } else if (offset < -swipeThreshold) {
        setSwipeDirection('left');
      } else {
        x.set(0);
      }
    };

    let animateProps = { x: xOffset, y: 0, scale, rotate: 0, opacity: baseOpacity };
    if (index === 0 && swipeDirection === 'right') {
      animateProps = { x: 1000, y: 0, scale, rotate: 0, opacity: 0 };
    } else if (index === 0 && swipeDirection === 'left') {
      animateProps = { x: -1000, y: 0, scale, rotate: 0, opacity: 0 };
    }

    return (
      <motion.div
        drag={index === 0 && !swipeDirection ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ x: xOffset, y: 0, scale, rotate: 0, opacity: baseOpacity }}
        animate={animateProps}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onAnimationComplete={() => {
          if (index === 0 && swipeDirection) {
            handleSwiped(swipeDirection);
          }
        }}
        style={{
          x,
          rotate,
          backgroundColor: card.color,
          zIndex: visibleCount - index
        }}
        className="absolute top-0 left-0 w-[300px] h-[400px] rounded-lg shadow-xl flex items-center justify-center text-white text-2xl select-none cursor-grab"
      >
        {card.text}
      </motion.div>
    );
  }

  const visibleCards = cards.slice(0, visibleCount);

  return (
    <div
      style={{
        position: 'relative',
        width: '300px',   // adjust width as needed
        height: '400px',
        margin: '0 auto',
        overflow: 'visible' // allow cards to overlap outside container if desired
      }}
    >
      {[...visibleCards].reverse().map((card, i) => {
        const reversedIndex = visibleCount - i - 1;
        return <TinderCard key={card.id} card={card} index={reversedIndex} />;
      })}
    </div>
  );
}

export default TinderStack;