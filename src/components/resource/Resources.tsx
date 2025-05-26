import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, BookIcon, ExternalLink, Download, Pencil, Folder, Trophy, BookOpen, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
  external_link: string | null;
  created_at: string;
  created_by: string;
  creator_username: string;
  category: string;
}

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const isBlogPost = resource.content?.includes('<img src="') || false;

  return (
    <Card className="cyber-card overflow-hidden h-full flex flex-col bg-cyber-darkgray/80">
      <CardContent className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-cyber-blue truncate">{resource.title}</h3>
          <div className="flex gap-1">
            <span className="bg-cyber-blue/20 text-cyber-blue text-xs px-2 py-1 rounded">
              {resource.category}
            </span>
            {isBlogPost && (
              <span className="bg-cyber-green/20 text-cyber-green text-xs px-2 py-1 rounded">
                Blog
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{resource.description}</p>
        <div className="text-xs text-gray-400 mb-2 flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          <span>By {resource.creator_username}</span>
        </div>
        <div className="text-xs text-gray-400 mb-2">
          {new Date(resource.created_at).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter className="bg-cyber-black/40 p-4 flex items-center justify-between">
          <Button
  size="sm"
  className="bg-sky-600 hover:bg-sky-700 text-white border border-sky-500 font-semibold px-4 py-2 rounded-md transition"
  onClick={(e) => {
    e.preventDefault();
    window.open(`/resources/${resource.id}`, '_self');
  }}
>
  <BookIcon className="h-4 w-4 mr-2" />
  View
</Button>


        <div className="flex space-x-2">
          {resource.external_link && (
            <Button
              variant="outline"
              size="sm"
              className="text-cyber-green border-cyber-green hover:bg-cyber-green/20"
              onClick={() => window.open(resource.external_link!, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          {resource.file_url && (
            <Button
              variant="outline"
              size="sm"
              className="text-cyber-yellow border-cyber-yellow hover:bg-cyber-yellow/20"
              onClick={() => window.open(resource.file_url!, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 9999);

      if (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        throw resourcesError;
        } 

      const enhancedResources = await Promise.all(resourcesData.map(async (resource) => {
  try {
    const { data: userData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', resource.created_by)
      .single();
      
    return {
      ...resource,
      creator_username: userData?.username || 'Unknown'
    };
  } catch (err) {
    console.error(`Error fetching profile for resource ${resource.id}:`, err);
    return {
      ...resource,
      creator_username: 'Unknown'
    };
  }
}));

      return enhancedResources;
    }
  });

  const getResourcesByCategory = (category: string) => {
    return resources?.filter(resource => resource.category === category) || [];
  };

  const tutorials = getResourcesByCategory('tutorial');
  const tools = getResourcesByCategory('tool');
  const references = getResourcesByCategory('reference');
  const miscResources = getResourcesByCategory('other');

  return (
    <div className="min-h-screen flex flex-col bg-cyber-black text-white">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-16 pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyber-blue mb-2">Learning Resources</h1>
            <p className="text-gray-400">
              Discover resources to help you improve your cybersecurity skills
            </p>
          </div>

          {/* NEW BUTTON BLOCK for logged-in users */}
          {user && (
            <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
              <Button
                onClick={() => navigate('/blog-editor')}
                className="bg-emerald-600 border border-emerald-400/50 hover:bg-emerald-700/30 text-white"
              >
                <Pencil className="mr-2 h-4 w-4" /> Write a Blog
              </Button>
              <Button
                onClick={() => navigate('/creator-studio')}
                className="bg-cyber-pink border border-cyber-pink/50 hover:bg-cyber-pink/30 text-white"
              >
                <Folder className="mr-2 h-4 w-4" /> Creator Studio
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-cyber-blue animate-pulse">Loading resources...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">Error loading resources</p>
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="space-y-10">
            {tutorials.length > 0 && (
              <section>
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-cyber-green">Tutorials</h2>
                  <Separator className="ml-4 grow h-px bg-cyber-green/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutorials.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}

            {tools.length > 0 && (
              <section>
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-cyber-yellow">Tools</h2>
                  <Separator className="ml-4 grow h-px bg-cyber-yellow/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}

            {references.length > 0 && (
              <section>
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-cyber-blue">References</h2>
                  <Separator className="ml-4 grow h-px bg-cyber-blue/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {references.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}

            {miscResources.length > 0 && (
              <section>
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-cyber-purple">Other Resources</h2>
                  <Separator className="ml-4 grow h-px bg-cyber-purple/30" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {miscResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-400 mb-4">No resources available yet</p>
            {user && (
              <div className="flex flex-col md:flex-row justify-center gap-3">
                <Button
                  onClick={() => navigate('/blog-editor')}
                  className="bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green border border-cyber-green"
                >
                  <Pencil className="mr-2 h-4 w-4" /> Write a Blog
                </Button>
                <Button
                  onClick={() => navigate('/creator-studio')}
                  className="bg-cyber-pink/20 hover:bg-cyber-pink/30 text-cyber-pink border border-cyber-pink"
                >a
                  <Folder className="mr-2 h-4 w-4" /> Creator Studio
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
