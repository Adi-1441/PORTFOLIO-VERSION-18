// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — AUTH & AUTHORIZATION TYPES
// Strict state machine preventing false "Unauthorized" flashes.
// ==============================================================================

import { User, Session } from '@supabase/supabase-js';
import { AdminUser } from './database';

export type AuthStateStatus = 
  | 'CHECKING_SESSION'
  | 'AUTHENTICATED'
  | 'UNAUTHENTICATED'
  | 'CHECKING_ADMIN'
  | 'AUTHORIZED'
  | 'UNAUTHORIZED'
  | 'ERROR';

export interface AuthContextType {
  status: AuthStateStatus;
  user: User | null;
  session: Session | null;
  adminRecord: AdminUser | null;
  isAuthorizedAdmin: boolean;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshAdminStatus: () => Promise<void>;
}
