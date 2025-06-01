
import { supabase } from '@/lib/supabase';

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

export const getCompanyLogoUrl = (): string => {
  const { data } = supabase.storage
    .from('company-assets')
    .getPublicUrl('logos/anygas-logo.png');
  
  return data.publicUrl;
};
