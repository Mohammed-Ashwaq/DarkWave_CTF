
import React from 'react';
import { Card } from '@/components/ui/card';
import { Terminal } from 'lucide-react';
import { Challenge } from '@/types/challenge';

interface ChallengeDescriptionProps {
  challenge: Challenge;
}

const ChallengeDescription: React.FC<ChallengeDescriptionProps> = ({ challenge }) => {
  return (
    <Card className="cyber-border bg-cyber-darkgray/80 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Terminal className="mr-2 text-cyber-blue" /> 
        <span className='text-white'>Description</span>
      </h2>
      <p className="text-gray-300 whitespace-pre-line">{challenge.description}</p>
    </Card>
  );
};

export default ChallengeDescription;
