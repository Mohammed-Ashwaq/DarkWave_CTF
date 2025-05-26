
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import BlogEditor from '@/components/blog/BlogEditor';
import { useAuth } from '@/contexts/AuthContext';

const BlogEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // Extract edit ID from query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  
  const { data: existingResource, isLoading } = useQuery({
    queryKey: ['blog', editId],
    queryFn: async () => {
      if (!editId) return null;
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', editId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!editId,
  });
  
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/auth?redirect=blog-editor');
    }
  }, [user, isAuthLoading, navigate]);
  
  const handleSuccess = () => {
    navigate('/resources');
  };
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cyber-black text-white">
        <Navbar />
        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <p className="text-cyber-blue animate-pulse">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to auth page due to useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-cyber-black text-white">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="text-cyber-blue hover:bg-cyber-blue/10"
            onClick={() => navigate('/resources')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
          </Button>
        </div>
        
        <Card className="bg-cyber-darkgray/80 border-cyber-blue/20 p-6">
          <h1 className="text-2xl font-bold text-cyber-blue mb-6">
            {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          
          {isLoading && editId ? (
            <div className="text-center py-10">
              <p className="text-cyber-blue animate-pulse">Loading blog data...</p>
            </div>
          ) : (
            <BlogEditor 
              existingResource={existingResource} 
              onSuccess={handleSuccess}
            />
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default BlogEditorPage;
