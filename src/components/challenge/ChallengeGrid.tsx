
import React, { useState } from 'react';
import ChallengeCard from './ChallengeCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CategoryType = 'All' | string;
type DifficultyType = 'All' | 'easy' | 'medium' | 'hard';

const ChallengeGrid = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyType>('All');

  // Fetch all challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true })
        .order('points', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Extract unique categories for filter
  const { data: categories = ['All'] } = useQuery({
    queryKey: ['challenge-categories'],
    queryFn: async () => {
      if (!challenges) return ['All'];
      
      const uniqueCategories = Array.from(
        new Set(challenges.map((challenge: any) => challenge.category))
      );
      
      return ['All', ...uniqueCategories];
    },
    enabled: !!challenges
  });

  // Filter challenges based on search and filters
  const filteredChallenges = challenges?.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || challenge.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || challenge.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const difficulties: DifficultyType[] = ['All', 'easy', 'medium', 'hard'];

  return (
    <div className="bg-cyber-black py-12">
      <div className="container mx-auto px-4">
        
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cyber-darkgray border-cyber-blue text-white"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                className={categoryFilter === category 
                  ? "bg-green-500/20 text-green-500 border-green-500 hover:bg-cyber-blue/80" 
                  : "bg-green-500/20 text-green-500 border-green-500"}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
            <div className="flex gap-2 overflow-x-auto pb-2">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={difficultyFilter === difficulty ? "default" : "outline"}
                  className={
                    difficultyFilter === difficulty
                      ? difficulty === 'easy'
                        ? "bg-green-500/20 text-green-500 border-green-500 hover:bg-cyber-blue/80"
                        : difficulty === 'medium'
                          ? "bg-yellow-500/20 text-yellow-500 border-yellow-500 hover:bg-cyber-blue/80"
                          : difficulty === 'hard'
                            ? "bg-red-500/20 text-red-500 border-red-500 hover:bg-cyber-blue/80"
                            : "bg-cyber-blue/20 text-cyber-blue border-cyber-blue hover:bg-cyber-blue/80"
                      : "bg-transparent text-gray-500 border-gray-300 hover:bg-gray-200"
                  }
                  onClick={() => setDifficultyFilter(difficulty)}
                >
                  {difficulty === 'All' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Button>
              ))}
            </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-cyber-blue animate-pulse">Loading challenges...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges && filteredChallenges.length > 0 ? (
              filteredChallenges.map((challenge: any) => (
                <ChallengeCard 
                  key={challenge.id} 
                  id={challenge.id}
                  title={challenge.title}
                  category={challenge.category}
                  points={challenge.points}
                  difficulty={challenge.difficulty}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p className="text-xl mb-2">No challenges match your filters</p>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeGrid;
