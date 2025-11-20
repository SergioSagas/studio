'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import type { UserProfile } from '@/firebase/provider';

export function useUserRole() {
  const { userProfile, isProfileLoading, isUserLoading } = useUser();
  const [role, setRole] = useState<UserProfile['role'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loading = isUserLoading || isProfileLoading;
    setIsLoading(loading);
    if (!loading) {
        setRole(userProfile?.role ?? null);
    }
  }, [userProfile, isUserLoading, isProfileLoading]);

  return { role, isLoading };
}
