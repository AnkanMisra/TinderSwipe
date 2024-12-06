import React from 'react';
import TinderStack from './components/TinderStack';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Tinder-Style Swipe Demo</h1>
      <TinderStack />
    </div>
  );
}

export default App;