'use client';
import { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { hasPermission, canModifyResource } from '@/lib/rbac';
import type { Permission, Role } from '@/lib/rbac';

interface ProtectedProps {
  children: ReactNode;
  requirePermission?: Permission;
  requireRole?: Role[];
  fallback?: ReactNode;
}

// Wrapper component to show/hide content based on permissions
export function Protected({ children, requirePermission, requireRole, fallback = null }: ProtectedProps) {
  const { user } = useAuth();

  // Check role requirement
  if (requireRole && (!user || !requireRole.includes(user.role))) {
    return <>{fallback}</>;
  }

  // Check permission requirement
  if (requirePermission && !hasPermission(user?.role, requirePermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ResourceOwnershipProps {
  children: ReactNode;
  resourceOwnerId: string;
  fallback?: ReactNode;
}

// Wrapper to show content only if user is owner or admin
export function RequireOwnership({ children, resourceOwnerId, fallback = null }: ResourceOwnershipProps) {
  const { user } = useAuth();

  if (!canModifyResource(user?.role, user?.userId, resourceOwnerId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook to check permissions
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  return hasPermission(user?.role, permission);
}

// Hook to check if user can modify a resource
export function useCanModify(resourceOwnerId: string): boolean {
  const { user } = useAuth();
  return canModifyResource(user?.role, user?.userId, resourceOwnerId);
}
