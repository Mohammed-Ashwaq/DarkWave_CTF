import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Terminal, Code, Bug } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-cyber-black text-gray-300 min-h-screen font-mono">
      <Navbar />

      <header className="py-20 bg-cyber-darkgray border-b border-cyber-blue shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold neon-text mb-4 tracking-tight">
            ABOUT <span className="pink-neon-text">DarkWaveCTF</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400">
            A next-generation CTF platform designed to challenge and inspire hackers of all skill levels.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 space-y-20">
        {/* What is CTF */}
        <Section icon={<Code className="text-cyber-pink h-6 w-6" />} title="What is a CTF?" textColor="text-cyber-pink">
          <p>
            A Capture The Flag (CTF) is a cybersecurity competition where participants solve challenges in fields such as ethical hacking,
            cryptography, reverse engineering, and forensics. Solving each challenge earns a "flag" — a unique string that proves the task was completed.
          </p>
          <p className="mt-4">
            Points are awarded for each flag, and players compete for the top spot on the leaderboard. CTFs simulate real-world cyber threats,
            providing hands-on experience in a safe environment.
          </p>
        </Section>

        {/* Our Mission */}
        <Section icon={<Terminal className="text-cyber-blue h-6 w-6" />} title="Our Mission" textColor="text-cyber-blue">
          <p>
            DarkWaveCTF was created to provide a fun and realistic training ground for aspiring and experienced cybersecurity professionals.
            We believe practical, hands-on learning is the best way to master security concepts.
          </p>
          <p className="mt-4">
            Our mission is to bridge the gap between theory and practice by offering challenges that mirror real-world attack and defense scenarios.
          </p>
        </Section>

        {/* How It Works */}
        <Section icon={<Code className="text-cyber-pink h-6 w-6" />} title="How It Works" textColor="text-cyber-pink">
          <p>
            Explore challenges across categories like web exploitation, binary exploitation, cryptography, and forensics.
            Solve them to find a hidden flag and submit it to earn points and climb the leaderboard.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <InfoCard title="For Beginners" color="text-cyber-blue" bg="bg-cyber-darkgray/50">
              New to cybersecurity? Start with beginner-friendly challenges to grasp essential concepts.
            </InfoCard>
            <InfoCard title="For Experts" color="text-cyber-pink" bg="bg-cyber-darkgray/50">
              Already a pro? Take on advanced scenarios that mirror real-world attacks and hone your elite skills.
            </InfoCard>
          </div>
        </Section>

        {/* Team Section */}
        <Section icon={<Bug className="text-cyber-purple h-6 w-6" />} title="The Team" textColor="text-cyber-purple">
          <p className="mb-8">
            We’re a group of cybersecurity enthusiasts and professionals passionate about creating a fun and educational hacking experience.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <TeamMember name="CyberNinja" role="Platform Architect" image="https://placehold.co/100/1E1E1E/00FFFF?text=CN" />
            <TeamMember name="HackMaster" role="Challenge Creator" image="https://placehold.co/100/1E1E1E/FF00FF?text=HM" />
            <TeamMember name="ByteHunter" role="Security Researcher" image="https://placehold.co/100/1E1E1E/8B5CF6?text=BH" />
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

// Section Component
const Section = ({
  icon,
  title,
  textColor,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  textColor: string;
  children: React.ReactNode;
}) => (
  <section className="fade-in">
    <div className="flex items-center mb-4">
      <div className="mr-3">{icon}</div>
      <h2 className={`text-3xl font-bold ${textColor}`} style={{ textShadow: `0 0 10px` }}>{title}</h2>
    </div>
    <div className="space-y-4 text-gray-300 leading-relaxed">{children}</div>
  </section>
);

// Info Card Component
const InfoCard = ({
  title,
  children,
  color,
  bg,
}: {
  title: string;
  children: string;
  color: string;
  bg: string;
}) => (
  <div className={`rounded-xl p-6 border border-cyber-border ${bg} shadow-lg hover:shadow-cyber transition-all`}>
    <h3 className={`text-xl font-semibold mb-2 ${color}`}>{title}</h3>
    <p className="text-gray-300">{children}</p>
  </div>
);

// Team Member Card
const TeamMember = ({ name, role, image }: { name: string; role: string; image: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="border border-cyber-border p-1 rounded-full mb-4 shadow-cyber">
      <img src={image} alt={name} className="w-24 h-24 rounded-full object-cover" />
    </div>
    <h3 className="text-lg font-semibold text-white">{name}</h3>
    <p className="text-cyber-purple">{role}</p>
  </div>
);

export default About;
