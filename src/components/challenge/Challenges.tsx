
import React from 'react';
import Navbar from '@/components/Navbar';
import ChallengeGrid from '@/components/challenge/ChallengeGrid';
import Footer from '@/components/Footer';

const Challenges = () => {
  return (
    <div className="bg-cyber-black min-h-screen">
      <Navbar />
      <div className="py-24 bg-cyber-darkgray border-b border-cyber-blue relative overflow-hidden">
        {/* Decorative cyber elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyber-blue"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-cyber-pink"></div>
          <div className="absolute top-8 left-8 w-20 h-20 border border-cyber-blue rotate-45"></div>
          <div className="absolute bottom-8 right-8 w-20 h-20 border border-cyber-pink -rotate-12"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-4 neon-text">CHALLENGES</h1>
          <p className="text-gray-300 max-w-3xl">
            Test your hacking skills across various categories. Each challenge contains a flag that you need to find and submit to earn points. 
            Good luck, hacker!
          </p>
        </div>
      </div>
      <ChallengeGrid />
      <Footer />
    </div>
  );
};

export default Challenges;
