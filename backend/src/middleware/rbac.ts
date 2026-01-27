import { Request, Response, NextFunction } from 'express';
import { hasPermission, Permission, Role } from '../config/roles';

// Audit logging utility
export function logRBACDecision(
  userId: string,
  role: Role,
  permission: Permission,
  resource: string,
  allowed: boolean
): void {
  const timestamp = new Date().toISOString();
  const status = allowed ? 'ALLOWED' : 'DENIED';
  const logMessage = `[RBAC] ${timestamp} | User: ${userId} | Role: ${role} | Permission: ${permission} | Resource: ${resource} | Status: ${status}`;
  
  console.log(logMessage);
  
  // In production, you would also write this to a file or database
  // For now, we'll just log to console for demonstration
}

// Middleware to check if user has required permission
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logRBACDecision('unknown', 'viewer', permission, req.path, false);
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const { userId, role } = req.user;
    const allowed = hasPermission(role, permission);

    logRBACDecision(userId, role, permission, req.path, allowed);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Your role (${role}) does not have '${permission}' permission`,
        code: 'PERMISSION_DENIED',
        requiredPermission: permission,
        userRole: role
      });
    }

    next();
  };
}

// Middleware to check if user has any of the required roles
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const { role } = req.user;
    const allowed = allowedRoles.includes(role);

    logRBACDecision(req.user.userId, role, 'read', req.path, allowed);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Role '${role}' is not authorized for this resource`,
        code: 'ROLE_NOT_AUTHORIZED',
        requiredRoles: allowedRoles,
        userRole: role
      });
    }

    next();
  };
}

// Middleware to check resource ownership (for artist managing their own artworks)
export function requireOwnershipOrAdmin(getUserIdFromResource: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const { userId, role } = req.user;
    const resourceOwnerId = getUserIdFromResource(req);

    // Admin can access any resource
    if (role === 'admin') {
      logRBACDecision(userId, role, 'update', req.path, true);
      return next();
    }

    // Check if user owns the resource
    const isOwner = userId === resourceOwnerId;
    logRBACDecision(userId, role, 'update', `${req.path} (ownership check)`, isOwner);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only modify your own resources',
        code: 'NOT_RESOURCE_OWNER'
      });
    }

    next();
  };
}
