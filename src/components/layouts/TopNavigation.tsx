
import React, { useState } from 'react';
import Logo from './navigation/Logo';
import MainNavigation from './navigation/MainNavigation';
import NotificationButton from './navigation/NotificationButton';
import UserMenu from './navigation/UserMenu';

const TopNavigation = () => {
  const [unreadNotifications] = useState(3);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Main Navigation */}
          <MainNavigation />

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationButton unreadCount={unreadNotifications} />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
