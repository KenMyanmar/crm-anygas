
import React from 'react';
import Logo from './navigation/Logo';
import MainNavigation from './navigation/MainNavigation';
import NotificationButton from './navigation/NotificationButton';
import UserMenu from './navigation/UserMenu';
import MobileNavigation from './navigation/MobileNavigation';
import { useNotifications } from '@/context/NotificationContext';

const TopNavigation = () => {
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Navigation - Left Side */}
          <div className="flex items-center space-x-3 md:hidden">
            <MobileNavigation unreadNotifications={unreadCount} />
            <Logo />
          </div>

          {/* Desktop Navigation - Left Side */}
          <div className="hidden md:flex">
            <Logo />
          </div>

          {/* Desktop Main Navigation - Center */}
          <MainNavigation />

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications - Always visible but smaller on mobile */}
            <NotificationButton unreadCount={unreadCount} />

            {/* User Menu - Hidden on mobile (included in mobile nav) */}
            <div className="hidden md:block">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
