'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UseUserReturn, Profile } from '@/types/auth';
import type { User } from '@supabase/supabase-js';

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser ?? null);

        if (currentUser) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          setProfile(profileRow ?? null);
        } else {
          setProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        return;
      }

      supabase
        .from('profiles')
        .select('*')
        .eq('id', nextUser.id)
        .single()
        .then(({ data }) => {
          setProfile(data ?? null);
        })
        .catch(() => {
          setProfile(null);
        });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, isLoading };
}

