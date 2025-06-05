
import { useAuth } from '@/context/AuthContext';
import ProfileInformation from '@/components/profile/ProfileInformation';
import SecuritySettings from '@/components/profile/SecuritySettings';
import SignOutSection from '@/components/profile/SignOutSection';

const ProfilePage = () => {
  const { profile } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        </div>

        {/* Profile Information Card */}
        <ProfileInformation profile={profile} initials={initials} />

        {/* Security Settings Card */}
        <SecuritySettings profile={profile} />

        {/* Sign Out */}
        <SignOutSection />
      </div>
    </div>
  );
};

export default ProfilePage;
