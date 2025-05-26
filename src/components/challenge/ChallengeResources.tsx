
import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Key } from 'lucide-react';
import { Resource } from '@/types/challenge';

interface ChallengeResourcesProps {
  resources: Resource[] | null;
}

const ChallengeResources: React.FC<ChallengeResourcesProps> = ({ resources }) => {
  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    return null;
  }

  return (
    <Card className="cyber-border bg-cyber-darkgray/80 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Zap className="mr-2 text-cyber-yellow" /> Resources
      </h2>
      <div className="space-y-2">
        {resources.map((resource: Resource, index: number) => (
          <div key={index} className="flex items-center">
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyber-blue hover:underline flex items-center"
            >
              <Key className="h-4 w-4 mr-2" />
              {resource.name}
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ChallengeResources;
