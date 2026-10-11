// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN ROUTE GUARD
// Deep-link protection, session restoration, and non-admin rejection.
// Never flashes "Unauthorized" during session check.
// ==============================================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, isAuthorizedAdmin } = useAuth();
  const location = useLocation();

  // State 1: Checking session or verifying admin role
  if (status === 'CHECKING_SESSION' || status === 'CHECKING_ADMIN') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-void)',
      }}>
        <LoadingSpinner label="VERIFYING CRYPTOGRAPHIC ACCESS CLEARANCE..." size="lg" />
      </div>
    );
  }

  // State 2: Unauthenticated → redirect to /admin/login
  if (status === 'UNAUTHENTICATED') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // State 3: Authenticated but not an enabled admin_users record → /admin/unauthorized
  if (status === 'UNAUTHORIZED' || !isAuthorizedAdmin) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // State 4: Authorized admin
  return <>{children}</>;
};
