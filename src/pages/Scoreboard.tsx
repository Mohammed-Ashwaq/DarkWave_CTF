
import React from 'react';
import Navbar from '@/components/Navbar';
import Leaderboard from '@/components/Leaderboard';
import Footer from '@/components/Footer';

const Scoreboard = () => {
  return (
    <div className="bg-cyber-black min-h-screen">
      <Navbar />
      <div className="pt-20 pb-12 bg-cyber-darkgray border-b border-cyber-blue">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 neon-text">SCOREBOARD</h1>
          <p className="text-gray-300 max-w-3xl">
            The top hackers in our cyberpunk arena. Will your handle appear on this list?
            Compete with others and climb the ranks.
          </p>
        </div>
      </div>
      <Leaderboard />
      <Footer />
    </div>
  );
};

export default Scoreboard;
