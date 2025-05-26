
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Lightbulb, EyeOff } from 'lucide-react';

interface ChallengeHintsProps {
  hints: string[] | null;
  hintsRevealed: number[];
  onRevealHint: (index: number) => void;
  isRevealingHint: boolean;
}

const ChallengeHints: React.FC<ChallengeHintsProps> = ({ 
  hints, 
  hintsRevealed, 
  onRevealHint, 
  isRevealingHint 
}) => {
  const [showAllHints, setShowAllHints] = useState(false);

  if (!hints || !Array.isArray(hints) || hints.length === 0) {
    return null;
  }

  const toggleAllHints = () => {
    setShowAllHints(!showAllHints);
  };

  return (
    <Card className="cyber-border bg-cyber-darkgray/80 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Info className="mr-2 text-cyber-yellow" /> 
          <span className='text-white'>Hints</span>
        </h2>
        <button 
          onClick={toggleAllHints}
          className="hint-toggle-button"
        >
          {showAllHints ? (
            <><EyeOff className="h-4 w-4 text-cyber-blue" /> 
            <span className='text-white'>Hide Hints</span></>
          ) : (
            <><Lightbulb className="h-4 w-4 text-cyber-blue" />
            <span className='text-white'>Show Hints</span></>
          )}
        </button>
      </div>
      
      {showAllHints ? (
        <div className="space-y-4 mt-4">
          {hints.map((hint: string, index: number) => (
            <div key={index} className="hint-container">
              {hintsRevealed.includes(index) ? (
                <p className="text-gray-300">{hint}</p>
              ) : (
                <div className="flex flex-col">
                  <p className="text-[#9b87f5] mb-2">Hint #{index + 1} (Locked)</p>
                  <Button 
                    variant="outline" 
                    className="hint-toggle-button self-start" 
                    onClick={() => onRevealHint(index)}
                    disabled={isRevealingHint}
                  >
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Reveal Hint
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mt-2 text-sm">
          Click the "Show Hints" button above to view available hints.
        </p>
      )}
      
      <p className="text-xs text-gray-400 mt-4">
        Note: Never hesitate to see the hinsts again if you're stuck somewhere.
      </p>
    </Card>
  );
};

export default ChallengeHints;
