
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-cyber-darkgray border-t border-cyber-blue relative mt-16">
      <div className="before:absolute before:inset-0 before:border-t before:border-cyber-pink before:opacity-50 before:translate-y-[-1px]"></div>
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center">
              <Shield className="h-6 w-6 text-cyber-blue" />
              <span className="ml-2 text-lg font-bold neon-text">DarkWave<span className="pink-neon-text">CTF</span></span>
            </Link>
            <p className="mt-3 text-gray-400 text-sm">
              A CTF platform for hackers to test and improve their skills.
            </p>
          </div>
          
          
          {/* <div>
            <h3 className="text-cyber-pink font-bold mb-3">COMMUNITY</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/scoreboard" className="hover:text-cyber-pink">Leaderboard</Link></li>
              <li><Link to="/teams" className="hover:text-cyber-pink">Teams</Link></li>
              <li><a href="#" className="hover:text-cyber-pink">Discord</a></li>
              <li><a href="#" className="hover:text-cyber-pink">Twitter</a></li>
            </ul>
          </div> */}
          
          {/* <div>
            <h3 className="text-cyber-purple font-bold mb-3">RESOURCES</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link to="/faq" className="hover:text-cyber-purple">FAQ</Link></li>
              <li><Link to="/rules" className="hover:text-cyber-purple">Rules</Link></li>
              <li><Link to="/about" className="hover:text-cyber-purple">About</Link></li>
              <li><Link to="/contact" className="hover:text-cyber-purple">Contact</Link></li>
            </ul>
          </div> */}
        </div>
        
        <div className="border-t border-cyber-blue/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 DarkWave. All rights reserved.</p>
          {/* <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-cyber-blue">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-cyber-blue">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-cyber-blue">
              Security
            </a>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
