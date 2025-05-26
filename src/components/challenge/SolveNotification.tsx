
import React from 'react';
import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { UserSolve } from '@/types/challenge';

interface SolveNotificationProps {
  userSolve: UserSolve | null;
}

const SolveNotification: React.FC<SolveNotificationProps> = ({ userSolve }) => {
  if (!userSolve) {
    return null;
  }

  return (
    <Card className="bg-cyber-green/10 border border-cyber-green p-6">
      <div className="flex items-center space-x-3 text-cyber-green">
        <Award className="h-6 w-6" />
        <h2 className="text-lg font-bold">Challenge Completed!</h2>
      </div>
      <p className="text-gray-300 mt-2">
        You've successfully captured the flag for this challenge on {new Date(userSolve.submitted_at).toLocaleString()}.
      </p>
    </Card>
  );
};

export default SolveNotification;
