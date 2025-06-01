
import { supabase } from '@/integrations/supabase/client';

export const uploadCompanyLogo = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `anygas-logo.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('company-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading logo:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('company-assets')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading logo:', error);
    return null;
  }
};

export const getCompanyLogoUrl = async (): Promise<string | null> => {
  try {
    // Try to find the logo file by checking for different extensions
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    
    for (const ext of extensions) {
      const filePath = `logos/anygas-logo.${ext}`;
      
      // Check if file exists by trying to get its metadata
      const { data, error } = await supabase.storage
        .from('company-assets')
        .list('logos', {
          search: `anygas-logo.${ext}`
        });
      
      if (!error && data && data.length > 0) {
        // File exists, return the public URL
        const { data: urlData } = supabase.storage
          .from('company-assets')
          .getPublicUrl(filePath);
        
        return urlData.publicUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting logo URL:', error);
    return null;
  }
};

// Fallback function that returns a default URL or null
export const getCompanyLogoUrlSync = (): string => {
  // Try the most common extension first as a fallback
  const { data } = supabase.storage
    .from('company-assets')
    .getPublicUrl('logos/anygas-logo.png');
  
  return data.publicUrl;
};
