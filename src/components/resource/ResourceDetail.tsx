import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User, ExternalLink, Download, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      // First, get the resource details
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (resourceError) throw resourceError;
      if (!resourceData) throw new Error('Resource not found');
      
      // Then, get the creator's username separately
      if (resourceData.created_by) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', resourceData.created_by)
          .single();
        
        return {
          ...resourceData,
          creator_username: userData?.username || 'Unknown'
        };
      }
      
      return {
        ...resourceData,
        creator_username: 'Unknown'
      };
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-cyber-black text-white">
        <Navbar />
        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <p className="text-cyber-blue animate-pulse">Loading resource...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !resource) {
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
          
          <Card className="bg-cyber-darkgray border-red-500/30">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-2">Resource Not Found</h2>
              <p className="text-gray-400 mb-6">The resource you're looking for does not exist or has been removed.</p>
              <Button 
                onClick={() => navigate('/resources')} 
                className="bg-cyber-blue text-black font-semibold"
              >
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine if this is a blog post (has screenshots in the content)
  const isBlogPost = resource?.content?.includes('<img src="') || false;

  return (
    <div className="min-h-screen flex flex-col bg-cyber-black text-white">
      <Navbar />
      <main className="flex-grow container mx-auto p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <Button 
            variant="ghost" 
            className="text-cyber-blue hover:bg-cyber-blue/10"
            onClick={() => navigate('/resources')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resources
          </Button>
          
          {isAdmin && resource && (
            <Button 
              onClick={() => navigate(`/creator-studio?edit=${resource.id}`)}
              className="mt-4 md:mt-0 bg-cyber-yellow/20 hover:bg-cyber-yellow/30 text-cyber-yellow border border-cyber-yellow"
            >
              Edit Resource
            </Button>
          )}
        </div>
        
        {resource && (
          <Card className={`bg-cyber-darkgray/80 border-cyber-blue/20 overflow-hidden ${isBlogPost ? 'max-w-4xl mx-auto' : ''}`}>
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-cyber-blue/20 text-cyber-blue text-xs px-2 py-1 rounded flex items-center">
                  <Tag className="mr-1 h-3 w-3" />
                  {resource.category}
                </span>
                {isBlogPost && (
                  <span className="bg-cyber-green/20 text-cyber-green text-xs px-2 py-1 rounded">
                    Blog Post
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-cyber-blue mb-4">{resource.title}</h1>
              
              <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-400 mb-6 space-y-2 md:space-y-0 md:space-x-6">
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" /> 
                  {resource.creator_username}
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" /> 
                  {new Date(resource.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {!isBlogPost && (
                <div className="bg-cyber-black/40 p-4 rounded-lg mb-6">
                  <p className="text-gray-300">{resource.description}</p>
                </div>
              )}
              
              {!isBlogPost && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {resource.external_link && (
                    <Button 
                      variant="outline" 
                      className="text-cyber-green border-cyber-green hover:bg-cyber-green/20"
                      onClick={() => window.open(resource.external_link, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> External Link
                    </Button>
                  )}
                  
                  {resource.file_url && (
                    <Button 
                      variant="outline" 
                      className="text-cyber-yellow border-cyber-yellow hover:bg-cyber-yellow/20"
                      onClick={() => window.open(resource.file_url, '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download File
                    </Button>
                  )}
                </div>
              )}
              
              {resource.content && (
                <>
                  {isBlogPost ? (
                    <div className="mt-6">
                      {/* For blog posts, show description at the top */}
                      <div className="bg-cyber-black/40 p-4 rounded-lg mb-6 italic">
                        <p className="text-gray-300">{resource.description}</p>
                      </div>
                      <Separator className="my-6 bg-cyber-blue/20" />
                    </div>
                  ) : (
                    <Separator className="my-6 bg-cyber-blue/20" />
                  )}
                  
                  <div className={`prose prose-invert ${isBlogPost ? 'max-w-none prose-lg' : 'max-w-none'}`}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: resource.content }} 
                      className={isBlogPost ? 'blog-content' : 'text-white'}
                    />
                  </div>
                </>
              )}
              
              {isBlogPost && (resource.external_link || resource.file_url) && (
                <div className="mt-8 pt-6 border-t border-cyber-blue/20">
                  <h3 className="text-lg font-semibold mb-4 text-cyber-blue">Additional Resources</h3>
                  <div className="flex flex-wrap gap-3">
                    {resource.external_link && (
                      <Button 
                        variant="outline" 
                        className="text-cyber-green border-cyber-green hover:bg-cyber-green/20"
                        onClick={() => window.open(resource.external_link, '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Related Link
                      </Button>
                    )}
                    
                    {resource.file_url && (
                      <Button 
                        variant="outline" 
                        className="text-cyber-yellow border-cyber-yellow hover:bg-cyber-yellow/20"
                        onClick={() => window.open(resource.file_url, '_blank')}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Resource
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResourceDetail;
