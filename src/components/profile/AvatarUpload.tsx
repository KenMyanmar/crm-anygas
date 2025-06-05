
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Upload, X } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userInitials: string;
  onAvatarUpdate: (url: string) => void;
}

const AvatarUpload = ({ currentAvatarUrl, userInitials, onAvatarUpdate }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshProfile } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG or PNG image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      // Extract the file path from the Supabase storage URL
      // URL format: https://project.supabase.co/storage/v1/object/public/avatars/user-id/filename.ext
      const urlParts = url.split('/avatars/');
      if (urlParts.length > 1) {
        return urlParts[1]; // This gives us "user-id/filename.ext"
      }
      return null;
    } catch (error) {
      console.error('Error extracting file path from URL:', error);
      return null;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return;

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      console.log('=== Starting avatar upload ===');
      console.log('File name:', fileName);
      console.log('Current avatar URL:', currentAvatarUrl);

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldFilePath = extractFilePathFromUrl(currentAvatarUrl);
        console.log('Extracted old file path:', oldFilePath);
        
        if (oldFilePath) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([oldFilePath]);
          
          if (deleteError) {
            console.warn('Failed to delete old avatar:', deleteError);
          } else {
            console.log('Successfully deleted old avatar');
          }
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('=== File uploaded successfully ===');

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('=== Generated public URL ===', data.publicUrl);

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_pic_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('=== Database updated successfully ===');

      // Update local state
      onAvatarUpdate(data.publicUrl);
      
      // Refresh the profile in auth context to ensure sync
      await refreshProfile();
      
      toast({
        description: "Profile picture updated successfully",
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user?.id || !currentAvatarUrl) return;

    setIsUploading(true);
    try {
      console.log('=== Starting avatar removal ===');
      console.log('Current avatar URL:', currentAvatarUrl);

      // Delete from storage
      const filePath = extractFilePathFromUrl(currentAvatarUrl);
      console.log('Extracted file path for deletion:', filePath);

      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([filePath]);

        if (deleteError) {
          console.warn('Failed to delete avatar file:', deleteError);
        } else {
          console.log('Successfully deleted avatar file');
        }
      }

      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({ profile_pic_url: null })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      console.log('=== Database updated - avatar removed ===');

      // Update local state
      onAvatarUpdate('');
      setPreviewUrl(null);
      
      // Refresh the profile in auth context to ensure sync
      await refreshProfile();
      
      toast({
        description: "Profile picture removed successfully",
      });

    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={previewUrl || currentAvatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeAvatar}
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-2" />
              Remove Photo
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        JPG or PNG format, maximum 2MB
      </div>
    </div>
  );
};

export default AvatarUpload;
