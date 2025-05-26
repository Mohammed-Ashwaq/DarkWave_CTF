
import { Json } from '@/integrations/supabase/types';

export interface Resource {
  name: string;
  url: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  flag: string;
  hints: string[] | null;
  resources: Resource[] | null;
  is_active: boolean;
  created_at: string;
}

export interface UserSolve {
  id: string;
  user_id: string;
  challenge_id: string;
  submitted_at: string;
}

export interface UserHint {
  id: string;
  user_id: string;
  challenge_id: string;
  hint_index: number;
}
