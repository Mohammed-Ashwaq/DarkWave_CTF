
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="bg-cyber-black min-h-screen">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CyberFeature 
            title="Web Exploitation"
            description="Exploit vulnerable web applications, bypass authentication, and find hidden flags."
            icon="terminal"
          />
          <CyberFeature 
            title="Cryptography"
            description="Break codes, decrypt messages, and solve mathematical puzzles."
            icon="lock"
          />
          <CyberFeature 
            title="Binary Exploitation"
            description="Reverse engineer executables and discover memory corruption vulnerabilities."
            icon="binary"
          />
          <CyberFeature 
            title="Forensics"
            description="Analyze files, network packets, and other digital evidence to find hidden clues."
            icon="scan"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

const CyberFeature = ({ title, description, icon }: { title: string; description: string; icon: string }) => {
  return (
    <div className="cyber-border bg-cyber-darkgray/50 p-6 transition-all hover:bg-cyber-darkgray">
      <h3 className="text-xl font-bold text-cyber-blue mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
};

export default Index;
