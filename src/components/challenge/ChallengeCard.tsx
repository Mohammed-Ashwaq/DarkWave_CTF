
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Terminal, Lock, Cpu, ShieldCheck, Info, ChevronRight, Download, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export interface ChallengeProps {
  id: string;
  title: string;
  category: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  solved?: boolean;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-500 border-green-500',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
  hard: 'bg-red-500/20 text-red-500 border-red-500'
};

const categoryIcons = {
  'web': <Terminal className="h-4 w-4" />,
  'crypto': <Lock className="h-4 w-4" />,
  'forensics': <Cpu className="h-4 w-4" />,
  'pwn': <Terminal className="h-4 w-4" />,
  'reverse': <Cpu className="h-4 w-4" />
};

const ChallengeCard: React.FC<ChallengeProps> = ({ 
  id, 
  title, 
  category, 
  points, 
  difficulty
}) => {
  const { user } = useAuth();
  const lowerCategory = category.toLowerCase();
  const icon = categoryIcons[lowerCategory as keyof typeof categoryIcons] || <Terminal className="h-4 w-4" />;

  // Check if the challenge has been solved by the user
  const { data: isSolved } = useQuery({
    queryKey: ['challenge-solved', id, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('solves')
        .select('id')
        .eq('challenge_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if challenge is solved:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id
  });

  // Query to check if the challenge has hints
  const { data: hasHints } = useQuery({
    queryKey: ['challenge-hints', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('hints')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching hints:', error);
        return false;
      }
      
      return data.hints && Array.isArray(data.hints) && data.hints.length > 0;
    }
  });

  // Query to check if the challenge has resources/files
  const { data: hasResources } = useQuery({
    queryKey: ['challenge-resources', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('resources')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching resources:', error);
        return false;
      }
      
      return data.resources && Array.isArray(data.resources) && data.resources.length > 0;
    }
  });

  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg transition-all duration-300
        ${isSolved 
          ? 'bg-gradient-to-br from-cyber-darkgray/95 to-cyber-green/20 border-2 border-cyber-green/40 shadow-[0_0_15px_rgba(57,255,20,0.3)]' 
          : 'bg-gradient-to-br from-cyber-darkgray to-cyber-darkgray/70 border border-cyber-blue/50 hover:border-cyber-blue hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
        }
      `}
    >
      {/*Corner element */}
      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
        <div className={`absolute transform rotate-45 bg-${isSolved ? 'cyber-green' : 'cyber-blue'}/80 text-black w-16 h-3 top-3 right-[-8px]`}></div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className={`text-xl font-bold ${isSolved ? 'text-cyber-green' : 'text-white'} group-hover:text-cyber-blue transition-colors`}>
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-cyber-darkgray border-cyber-blue text-cyber-blue">
                {icon} {category}
              </Badge>
              <Badge variant="outline" className={`${difficultyColors[difficulty]}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
              {hasHints && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center gap-1 bg-cyber-darkgray border-cyber-yellow text-cyber-yellow">
                        <Info className="h-3 w-3" /> Hints
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-cyber-darkgray border-cyber-yellow text-white">
                      This challenge has hints available
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end">
              <span className={`text-lg font-mono ${isSolved ? 'text-cyber-green' : 'text-cyber-yellow'} font-bold`}>
                {points} 
              </span>
              <span className="ml-1 text-xs opacity-70">pts</span>
            </div>
            {isSolved && (
              <div className="text-cyber-green text-sm mt-1 flex items-center justify-end">
                <ShieldCheck className="h-3 w-3 mr-1" /> Solved
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {/* Action buttons row */}
          <div className="flex gap-2 mb-2">
            {hasHints && (
              <Link to={`/challenges/${id}#hints`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-cyber-darkgray/80 border-cyber-yellow hover:bg-cyber-yellow/20 text-cyber-yellow">
                  <Info className="h-4 w-4 mr-1" /> View Hints
                </Button>
              </Link>
            )}

            {hasResources && (
              <Link to={`/challenges/${id}#resources`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-cyber-darkgray/80 border-cyber-blue hover:bg-cyber-blue/20 text-cyber-blue">
                  <Download className="h-4 w-4 mr-1" /> Files
                </Button>
              </Link>
            )}
          </div>
          
          {/* Main action button */}
          <Link to={`/challenges/${id}`} className="block">
            <Button 
              className={`
                w-full flex items-center justify-between
                ${isSolved 
                  ? 'bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green border border-cyber-green' 
                  : 'cyber-button'
                }
              `}
            >
              <span>{isSolved ? 'View Solution' : 'Hack This Challenge'}</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
