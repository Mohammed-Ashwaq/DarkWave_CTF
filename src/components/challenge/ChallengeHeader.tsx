
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Terminal, ShieldCheck } from 'lucide-react';
import { Challenge, UserSolve } from '@/types/challenge';
import { getDifficultyColor } from '@/utils/challengeUtils';

interface ChallengeHeaderProps {
  challenge: Challenge;
  userSolve: UserSolve | null;
}

const ChallengeHeader: React.FC<ChallengeHeaderProps> = ({ challenge, userSolve }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold neon-text">{challenge.title}</h1>
        <div className="text-2xl font-mono text-cyber-yellow">{challenge.points} pts</div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="outline" className="bg-cyber-darkgray border-cyber-blue text-cyber-blue flex items-center gap-1">
          <Terminal className="h-4 w-4" />
          {challenge.category}
        </Badge>
        <Badge variant="outline" className={`${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
        </Badge>
        {userSolve && (
          <Badge variant="outline" className="bg-cyber-green/20 text-cyber-green border-cyber-green flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            Solved
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ChallengeHeader;
