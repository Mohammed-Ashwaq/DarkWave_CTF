
import { Json } from '@/integrations/supabase/types';
import { Resource } from '@/types/challenge';

// Helper function to safely transform JSON to Resource type
export const transformToResourceArray = (jsonData: Json | null): Resource[] | null => {
  if (!jsonData || !Array.isArray(jsonData)) return null;
  
  try {
    return jsonData.map(item => {
      if (typeof item === 'object' && item !== null && 'name' in item && 'url' in item) {
        return {
          name: String(item.name),
          url: String(item.url)
        };
      }
      throw new Error('Invalid resource format');
    });
  } catch (error) {
    console.error('Error transforming resources:', error);
    return null;
  }
};

// Helper function to transform JSON to string array
export const transformToStringArray = (jsonData: Json | null): string[] => {
  if (!jsonData) return [];

  // If it's already an array (valid JSON array), return as string[]
  if (Array.isArray(jsonData)) {
    return jsonData.map(item => String(item));
  }

  // If it's a plain string (e.g., multiline), split it
  if (typeof jsonData === 'string') {
    return jsonData
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  return [];
};


// Get difficulty color based on difficulty level
export const getDifficultyColor = (difficulty: string) => {
  switch(difficulty) {
    case 'easy': return 'bg-green-500/20 text-green-500 border-green-500';
    case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
    case 'hard': return 'bg-red-500/20 text-red-500 border-red-500';
    default: return 'bg-blue-500/20 text-blue-500 border-blue-500';
  }
};
