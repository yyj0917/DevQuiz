import type { User } from '@supabase/supabase-js';
import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UseUserReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

