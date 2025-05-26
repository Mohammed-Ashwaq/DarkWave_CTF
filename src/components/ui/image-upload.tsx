
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('blog_screenshots')
        .upload(filePath, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('blog_screenshots')
        .getPublicUrl(filePath);
        
      onImageUploaded(urlData.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button
        type="button" 
        variant="outline"
        className="w-full border-dashed border-2 text-cyber-blue border-cyber-blue/50 hover:bg-cyber-blue/10"
        disabled={isUploading}
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Screenshot'}
      </Button>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <p className="text-xs text-gray-400">
        Supported formats: JPG, PNG, GIF (max 5MB)
      </p>
    </div>
  );
};

export default ImageUpload;
