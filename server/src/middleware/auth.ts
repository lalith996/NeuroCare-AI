import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, hasPermission, Permission } from './permissions';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userRole = req.user.role;
    const hasRequiredPermissions = permissions.every((permission) =>
      hasPermission(userRole, permission)
    );

    if (!hasRequiredPermissions) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        role: userRole,
      });
      return;
    }

    next();
  };
};

// Middleware to allow access if user has ANY of the specified permissions
export const requireAnyPermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userRole = req.user.role;
    const hasAnyRequiredPermission = permissions.some((permission) =>
      hasPermission(userRole, permission)
    );

    if (!hasAnyRequiredPermission) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        role: userRole,
      });
      return;
    }

    next();
  };
};
