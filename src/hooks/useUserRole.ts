'use client';

import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useDoc } from '@/firebase';

type UserProfile = {
  role: 'admin' | 'user';
};

export function useUserRole() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) {
      setIsLoading(true);
      return;
    }

    if (user && userProfile) {
      setRole(userProfile.role);
    } else {
      setRole(null);
    }
    setIsLoading(false);
  }, [user, userProfile, isUserLoading, isProfileLoading]);

  return { role, isLoading };
}
