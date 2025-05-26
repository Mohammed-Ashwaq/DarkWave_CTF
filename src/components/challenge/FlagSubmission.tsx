
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { UserSolve } from '@/types/challenge';

interface FlagSubmissionProps {
  userSolve: UserSolve | null;
  onSubmitFlag: (flag: string) => void;
  isSubmitting: boolean;
}

const FlagSubmission: React.FC<FlagSubmissionProps> = ({ userSolve, onSubmitFlag, isSubmitting }) => {
  const [flagInput, setFlagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flagInput.trim()) {
      onSubmitFlag(flagInput);
    }
  };

  return (
    <Card className="cyber-border bg-cyber-darkgray/80 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Lock className="mr-2 text-cyber-green" /> 
        <span className="text-white">Submit Flag</span>
      </h2>
      <form onSubmit={handleSubmit}>
        <Input
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          placeholder="flag{...}"
          className="bg-cyber-black border-cyber-blue text-white mb-4"
          disabled={!!userSolve}
        />
        <Button 
          type="submit" 
          className="w-full cyber-button"
          disabled={!!userSolve || isSubmitting}
        >
          {userSolve ? 'Already Captured' : isSubmitting ? 'Submitting...' : 'Capture Flag'}
        </Button>
      </form>
    </Card>
  );
};

export default FlagSubmission;
