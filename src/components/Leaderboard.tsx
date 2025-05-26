
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Shield } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  points: number;
  is_admin: boolean;
  display_name: string | null;
  solves_count?: number;
  last_solve?: string;
}

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1: return "text-yellow-400";
    case 2: return "text-gray-300";
    case 3: return "text-amber-600";
    default: return "text-white";
  }
};

const Leaderboard = () => {
  // Fetch users for leaderboard
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['scoreboard'],
    queryFn: async () => {
      // Get profiles ordered by points
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Get solves for each user
      const { data: solves, error: solvesError } = await supabase
        .from('solves')
        .select('user_id, submitted_at')
        .order('submitted_at', { ascending: false });
      
      if (solvesError) throw solvesError;
      
      // Process data to add solves count and last solve
      const processedData = (profiles || []).map((profile: User) => {
        const userSolves = solves?.filter(solve => solve.user_id === profile.id) || [];
        return {
          ...profile,
          solves_count: userSolves.length,
          last_solve: userSolves.length > 0 ? userSolves[0].submitted_at : null
        };
      });
      
      return processedData;
    }
  });
  
  const formatLastSolveTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'Never';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center mb-10">
        <Trophy className="text-cyber-yellow h-8 w-8 mr-3" />
        <h2 className="text-3xl font-bold neon-text">LEADERBOARD</h2>
      </div>
      
      <div className="cyber-border bg-cyber-darkgray/80 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="text-cyber-blue animate-pulse">Loading leaderboard data...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-cyber-black/50 border-b border-cyber-blue">
                <TableHead className="text-cyber-blue w-20 text-center">Rank</TableHead>
                <TableHead className="text-cyber-blue">Hacker</TableHead>
                <TableHead className="text-cyber-blue text-center">Points</TableHead>
                <TableHead className="text-cyber-blue text-center hidden md:table-cell">Challenges</TableHead>
                <TableHead className="text-cyber-blue hidden lg:table-cell">Last Solve</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData && leaderboardData.length > 0 ? (
                leaderboardData.map((user: User, index) => (
                  <TableRow key={user.id} className="hover:bg-cyber-black/50 border-b border-cyber-blue/20">
                    <TableCell className={`font-mono text-center ${getRankStyle(index + 1)}`}>
                      {index + 1 <= 3 ? (
                        <span className="text-lg font-bold">{index + 1}</span>
                      ) : (
                        index + 1
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {user.is_admin && (
                          <Shield className="h-4 w-4 text-cyber-purple mr-2" />
                        )}
                        <span className="text-white">{user.display_name || user.username}</span>
                        {index + 1 <= 3 && (
                          <Badge className="ml-2 bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow">
                            Top {index + 1}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className={`font-mono text-center font-bold ${index + 1 <= 3 ? 'text-cyber-green' : 'text-white'}`}>
                      {user.points}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <Badge variant="outline" className="border-cyber-blue text-cyber-blue">
                        {user.solves_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400 hidden lg:table-cell">
                      {formatLastSolveTime(user.last_solve)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                    No users found. Be the first to solve a challenge!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
