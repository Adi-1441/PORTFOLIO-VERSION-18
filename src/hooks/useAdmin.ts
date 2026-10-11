import { useAuth } from '../context/AuthContext';

export function useAdmin() {
  const { status, user, adminRecord, isAuthorizedAdmin, errorMessage, refreshAdminStatus } = useAuth();

  const isChecking = status === 'CHECKING_SESSION' || status === 'CHECKING_ADMIN';
  const isUnauthorized = status === 'UNAUTHORIZED' || (status === 'AUTHENTICATED' && !adminRecord);

  return {
    isChecking,
    isAuthenticated: Boolean(user),
    isAuthorizedAdmin,
    isUnauthorized,
    role: adminRecord?.role || null,
    errorMessage,
    refreshAdminStatus,
  };
}
