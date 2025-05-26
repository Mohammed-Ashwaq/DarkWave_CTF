import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Challenge, UserSolve, UserHint } from '@/types/challenge';
import { transformToResourceArray, transformToStringArray } from '@/utils/challengeUtils';

// Import our components with the correct paths
import ChallengeHeader from '@/components/challenge/ChallengeHeader';
import ChallengeDescription from '@/components/challenge/ChallengeDescription';
import ChallengeResources from '@/components/challenge/ChallengeResources';
import SolveNotification from '@/components/challenge/SolveNotification';
import FlagSubmission from '@/components/challenge/FlagSubmission';
import ChallengeHints from '@/components/challenge/ChallengeHints';
import AdminAction from '@/components/admin/AdminAction';

const ChallengePage: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const { user, profile, refreshProfile, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hintsRevealed, setHintsRevealed] = useState<number[]>([]);
  
  // Fetch challenge data
  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        toast.error('Error loading challenge', {
          description: error.message
        });
        throw error;
      }
      
      // Convert the JSON data to the Challenge type with proper type transformations
      const challengeData: Challenge = {
        ...data,
        hints: transformToStringArray(data.hints),
        resources: transformToResourceArray(data.resources)
      };
      
      return challengeData;
    }
  });
  
  // Fetch user's solves for this challenge
  const { data: userSolve } = useQuery({
    queryKey: ['user-solve', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('solves')
        .select('*')
        .eq('challenge_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user solve:', error);
      }
      
      return data;
    },
    enabled: !!user?.id && !!id
  });
  
  // Fetch user's revealed hints for this challenge
  const { data: userHints } = useQuery({
    queryKey: ['user-hints', id, user?.id],
    queryFn: async () => {
      if (!id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('hints_used')
        .select('*')
        .eq('challenge_id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user hints:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!id
  });
  
  // Set initial hints revealed from database
  useEffect(() => {
    if (userHints && userHints.length > 0) {
      setHintsRevealed(userHints.map(hint => hint.hint_index));
    }
  }, [userHints]);
  
  // Submit flag mutation
  const submitFlagMutation = useMutation({
    mutationFn: async (flag: string) => {
      if (!user?.id || !challenge) throw new Error('User not authenticated or challenge not found');
      
      if (flag.trim().toLowerCase() === challenge.flag.trim().toLowerCase()) {
        // Check if already solved
        if (userSolve) {
          return { success: false, message: 'Already solved!' };
        }
        
        // Record the solve
        const { error: solveError } = await supabase
          .from('solves')
          .insert({
            user_id: user.id,
            challenge_id: challenge.id
          });
        
        if (solveError) throw solveError;
        
        // Fetch current user points first to ensure we're updating with the latest value
        const { data: currentUserData, error: profileError } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Update user points based on current points + challenge points
        const newPoints = (currentUserData?.points || 0) + challenge.points;
        
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', user.id);
        
        if (pointsError) throw pointsError;
        
        return { 
          success: true, 
          message: 'Correct flag!',
          points: challenge.points,
          newTotalPoints: newPoints
        };
      } else {
        return { 
          success: false, 
          message: 'Incorrect flag. Try again!'
        };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message, {
          description: `You earned ${result.points} points! Total: ${result.newTotalPoints} points`,
          position: "top-center"
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['user-solve'] });
        queryClient.invalidateQueries({ queryKey: ['solves'] });
        queryClient.invalidateQueries({ queryKey: ['scoreboard'] });
        queryClient.invalidateQueries({ queryKey: ['challenge-solved'] });
        
        // Refresh user profile to update points
        refreshProfile(user);
      } else {
        toast.error(result.message, {
          description: "Keep trying, hacker!",
          position: "top-center"
        });
      }
    },
    onError: (error: any) => {
      toast.error('Error submitting flag', {
        description: error.message,
        position: "top-center"
      });
    }
  });
  
  // Reveal hint mutation
  const revealHintMutation = useMutation({
    mutationFn: async (hintIndex: number) => {
      if (!user?.id || !challenge) {
        throw new Error('Cannot reveal hint');
      }
      
      // Check if hints exists and is an array
      if (!challenge.hints || hintIndex >= (challenge.hints?.length || 0)) {
        throw new Error('Invalid hint index');
      }
      
      const { error } = await supabase
        .from('hints_used')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          hint_index: hintIndex
        });
        
      if (error) throw error;
      
      return { success: true, hintIndex };
    },
    onSuccess: (result) => {
      setHintsRevealed(prev => [...prev, result.hintIndex]);
      
      queryClient.invalidateQueries({ queryKey: ['user-hints'] });
    },
    onError: (error: any) => {
      toast.error('Error revealing hint', {
        description: error.message
      });
    }
  });
  
  const handleFlagSubmit = (flag: string) => {
    if (!user) {
      toast.error('You need to be logged in to submit flags', {
        description: 'Please log in or sign up first',
        position: "top-center"
      });
      return;
    }
    
    if (!flag.trim()) {
      toast.error('Please enter a flag', {
        position: "top-center"
      });
      return;
    }
    
    submitFlagMutation.mutate(flag);
  };
  
  const revealHint = (index: number) => {
    if (!user) {
      toast.error('You need to be logged in to view hints', {
        description: 'Please log in or sign up first',
        position: "top-center"
      });
      return;
    }
    
    if (!hintsRevealed.includes(index)) {
      revealHintMutation.mutate(index);
    }
  };

  // Navigate to admin panel
  const goToAdminPanel = () => {
    navigate('/admin');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-cyber-blue animate-pulse">Loading challenge...</div>
        </div>
      </div>
    );
  }
  
  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Challenge not found</h1>
          <p className="text-gray-300">The challenge you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Admin Action */}
        <AdminAction isAdmin={!!isAdmin} onAdminAction={goToAdminPanel} />

        {/* Challenge Header */}
        <ChallengeHeader challenge={challenge} userSolve={userSolve} />
        
        <Separator className="my-6 bg-cyber-blue/30" />
        
        {/* Challenge Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <ChallengeDescription challenge={challenge} />
            
            {/* Resources */}
            <ChallengeResources resources={challenge.resources} />
            
            {/* Challenge solved notification */}
            <SolveNotification userSolve={userSolve} />
          </div>
          
          <div className="space-y-8">
            {/* Flag Submission */}
            <FlagSubmission 
              userSolve={userSolve} 
              onSubmitFlag={handleFlagSubmit}
              isSubmitting={submitFlagMutation.isPending}
            />
            
            {/* Hints */}
            <ChallengeHints 
              hints={challenge.hints}
              hintsRevealed={hintsRevealed}
              onRevealHint={revealHint}
              isRevealingHint={revealHintMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
