
import { useState } from 'react';
import { signInUser, signOutUser, resetUserPassword, updateUserPassword, fetchUserProfile } from '../services/authService';
import { User } from '../types';

export const useAuthOperations = (
  user: any,
  setProfile: (profile: User | null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      return await signInUser(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await signOutUser();
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await resetUserPassword(email);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      await updateUserPassword(password);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      console.log('=== Refreshing profile manually ===');
      try {
        const profileData = await fetchUserProfile(user.id);
        setProfile(profileData);
      } catch (error) {
        setProfile(null);
      }
    }
  };

  return {
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
};
