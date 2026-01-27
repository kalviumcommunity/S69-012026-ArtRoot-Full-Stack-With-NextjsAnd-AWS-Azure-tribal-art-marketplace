import { Request } from 'express';
import { Role } from '../config/roles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}

export {};
