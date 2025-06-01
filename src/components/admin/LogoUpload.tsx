
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadCompanyLogo } from '@/utils/logoUpload';

const LogoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const logoUrl = await uploadCompanyLogo(file);
      
      if (logoUrl) {
        setUploadComplete(true);
        toast({
          title: "Logo uploaded successfully",
          description: "The company logo has been updated and will appear in all print documents",
        });
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Company Logo Upload
        </CardTitle>
        <CardDescription>
          Upload the ANY GAS logo to use in all print documents (invoices, receipts, delivery orders)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="logo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploadComplete ? (
                  <Check className="w-8 h-8 mb-4 text-green-500" />
                ) : (
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
              </div>
              <input
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Uploading logo...
            </div>
          )}
          
          {uploadComplete && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Logo uploaded successfully! It will now appear in all print documents.
            </div>
          )}
          
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Note:</p>
              <p>Once uploaded, the logo will automatically appear in all delivery orders, invoices, and receipts. For best results, use a square logo with transparent background.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoUpload;
