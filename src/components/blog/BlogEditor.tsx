
import React, { useState } from 'react';
import ResourceForm from '@/components/resource/ResourceForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUpload from '@/components/ui/image-upload';
import { Separator } from '@/components/ui/separator';

interface BlogEditorProps {
  onSuccess?: () => void;
  existingResource?: any;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ onSuccess, existingResource }) => {
  const [error, setError] = useState<string |null>(null);
  const [content, setContent] = useState(existingResource?.content || '');
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  
  const handleImageUploaded = (url: string) => {
    try {
      if (!url) throw new Error('Invalid image URL');
      setContent(prev => `${prev}\n<img src="${url}" />\n`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="bg-cyber-darkgray p-4 rounded-lg border border-cyber-red">
        <h3 className="text-cyber-red">Editor Error</h3>
        <p>{error}</p>
        <Button onClick={() => setError(null)}>Retry</Button>
      </div>
    );
  }

  
  return (
    <div className="bg-color-black/50 p-6 rounded-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-cyber-blue">Write Your Blog</h3>
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-emerald-600 border border-emerald-400/50 hover:bg-emerald-700/30 text-white"
              >
                Add Screenshot
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-cyber-darkgray border-cyber-blue/30 text-white">
              <DialogHeader>
                <DialogTitle className="text-cyber-blue">Upload Screenshot</DialogTitle>
              </DialogHeader>
              <ImageUpload onImageUploaded={handleImageUploaded} />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="bg-cyber-black/50 p-4 rounded-lg">
          <p className="text-sm text-gray-300 mb-4">
            <strong>Tips:</strong> You can format your blog with HTML tags. Use &lt;h2&gt; for headings, &lt;p&gt; for paragraphs, 
            &lt;ul&gt; and &lt;li&gt; for lists, and &lt;a href="..."&gt; for links.
          </p>
        </div>
      </div>
      
      <Separator className="bg-cyber-blue/20" />
      
      <ResourceForm 
        existingResource={existingResource}
        onSuccess={onSuccess}
        defaultCategory="Blog"
        initialContent={content}
        showScreenshotTip={true}
        isBlogMode={true}
      />
    </div>
  );
};

export default BlogEditor;
