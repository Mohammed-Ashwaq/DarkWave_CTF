
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-cyber-black min-h-[80vh] flex items-center">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="mb-4 flex items-center">
            <Shield className="h-12 w-12 text-cyber-blue animate-pulse-neon" />
            <h1 className="text-4xl md:text-6xl font-bold ml-4">
              <span className="neon-text">DarkWave</span>
              <span className="pink-neon-text">CTF</span>
            </h1>
          </div>
          
          <p className="mt-3 max-w-md mx-auto md:mx-0 md:mt-5 md:max-w-3xl text-base md:text-xl text-gray-300">
            Enter the digital battleground. Hack, decrypt, exploit.
            <br />
            <span className="text-cyber-blue">Prove your skills in our cyberpunk-themed challenges.</span>
          </p>
          
          <div className="mt-10 sm:flex sm:justify-center md:justify-start">
            <div className="rounded-md shadow">
              <Link to="/challenges">
                <Button className="cyber-button flex items-center text-lg px-8 py-5">
                  <Terminal className="mr-2 h-5 w-5" /> 
                  START HACKING
                </Button>
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link to="/about">
                <Button variant="outline" className="cyber-button flex items-center text-lg px-8 py-5 border-cyber-pink hover:bg-cyber-pink">
                  <Shield className="mr-2 h-5 w-5" />
                  LEARN MORE
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto md:mx-0">
            <StatCard title="10+" description="Unique Challenges" color="blue" />
            <StatCard title="50+" description="Active Hackers" color="pink" />
            <StatCard title="24/7" description="CTF Environment" color="purple" />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 right-0 w-full md:w-1/2 pointer-events-none opacity-20 md:opacity-40">
        <img 
          src="https://placehold.co/600x400/121212/00FFFF?text=CYBER+NETWORK" 
          alt="Cyberpunk Network"
          className="w-full"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, description, color }: { 
  title: string; 
  description: string;
  color: 'blue' | 'pink' | 'purple';
}) => {
  const colorClass = {
    blue: 'border-cyber-blue text-cyber-blue',
    pink: 'border-cyber-pink text-cyber-pink',
    purple: 'border-cyber-purple text-cyber-purple',
  }[color];
  
  return (
    <div className={`cyber-border bg-cyber-darkgray/50 p-5 ${colorClass}`}>
      <h3 className="text-2xl md:text-3xl font-bold">{title}</h3>
      <p className="mt-2 text-gray-300">{description}</p>
    </div>
  );
};

export default Hero;
