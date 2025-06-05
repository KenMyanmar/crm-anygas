
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { User, Settings } from 'lucide-react';

interface ProfileInformationProps {
  profile: any;
  initials: string;
}

const ProfileInformation = ({ profile, initials }: ProfileInformationProps) => {
  const { refreshProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    profile_pic_url: profile?.profile_pic_url || '',
  });

  const handleSaveProfile = async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      // Refresh profile to sync changes
      await refreshProfile();

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    // Update local state to immediately reflect the change
    setProfileData(prev => ({ ...prev, profile_pic_url: url }));
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      full_name: profile?.full_name || '',
      profile_pic_url: profile?.profile_pic_url || '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <AvatarUpload
          currentAvatarUrl={profile?.profile_pic_url || ''}
          userInitials={initials}
          onAvatarUpdate={handleAvatarUpdate}
        />

        <Separator />

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            {isEditingProfile ? (
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            ) : (
              <div className="p-3 bg-muted rounded-md">{profile?.full_name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="p-3 bg-muted rounded-md text-muted-foreground">
              {profile?.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="p-3 bg-muted rounded-md text-muted-foreground capitalize">
              {profile?.role}
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="flex gap-2">
          {isEditingProfile ? (
            <>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditingProfile(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
