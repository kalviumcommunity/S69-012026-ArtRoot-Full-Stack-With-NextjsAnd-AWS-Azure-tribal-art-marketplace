// Role-Based Access Control (RBAC) Configuration

export type Permission = 'create' | 'read' | 'update' | 'delete' | 'manage_users';
export type Role = 'admin' | 'artist' | 'viewer';

// Role hierarchy and permissions mapping
export const roles: Record<Role, Permission[]> = {
  admin: ['create', 'read', 'update', 'delete', 'manage_users'],
  artist: ['create', 'read', 'update'], // Can manage own artworks
  viewer: ['read'], // Read-only access
};

// Role descriptions for documentation
export const roleDescriptions: Record<Role, string> = {
  admin: 'Full access to all resources including user management',
  artist: 'Can create, read, and update own artworks',
  viewer: 'Read-only access to artworks and public content',
};

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return roles[role]?.includes(permission) || false;
}

// Get all permissions for a role
export function getRolePermissions(role: Role): Permission[] {
  return roles[role] || [];
}

// Validate if a role exists
export function isValidRole(role: string): role is Role {
  return ['admin', 'artist', 'viewer'].includes(role);
}
