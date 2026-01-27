// Frontend roles configuration - mirrors backend roles
export type Role = 'admin' | 'artist' | 'viewer';
export type Permission = 'create' | 'read' | 'update' | 'delete' | 'manage_users';

// Role permissions mapping (same as backend)
export const rolePermissions: Record<Role, Permission[]> = {
  admin: ['create', 'read', 'update', 'delete', 'manage_users'],
  artist: ['create', 'read', 'update'],
  viewer: ['read'],
};

// Check if user's role has a specific permission
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

// Check if user can perform an action on a resource
export function canModifyResource(
  userRole: Role | undefined, 
  userId: string | undefined, 
  resourceOwnerId: string
): boolean {
  if (!userRole || !userId) return false;
  
  // Admin can modify anything
  if (userRole === 'admin') return true;
  
  // User can only modify their own resources
  return userId === resourceOwnerId;
}

// Role display names
export const roleDisplayNames: Record<Role, string> = {
  admin: 'Administrator',
  artist: 'Artist',
  viewer: 'Viewer',
};

// Role descriptions
export const roleDescriptions: Record<Role, string> = {
  admin: 'Full access to all resources and user management',
  artist: 'Can create and manage own artworks',
  viewer: 'Read-only access to public content',
};
