// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { sendUnauthorized, sendForbidden } from '../utils/response.util';
import { UserRole, BusinessRole, JWTPayload } from '../types/auth.type';

// Extend Express Request type to include user
declare global {
   namespace Express {
      interface Request {
         user?: JWTPayload;
      }
   }
}

export const authenticate = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return sendUnauthorized(res, ['Access token required']);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
         return sendUnauthorized(res, ['Access token required']);
      }

      const payload = await AuthService.verifyToken(token);
      req.user = payload;

      next();
   } catch (error: any) {
      return sendUnauthorized(res, [error.message || 'Invalid token']);
   }
};

export const authorize = (allowedRoles: (UserRole | BusinessRole)[]) => {
   return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
         return sendUnauthorized(res, ['Authentication required']);
      }

      const userRole = req.user.role;

      // Check if user has required global role
      if (allowedRoles.includes(userRole as any)) {
         return next();
      }

      // Check business-specific roles if business context is available
      const businessId =
         req.params.businessId || req.body.businessId || req.query.businessId;

      if (businessId && req.user.businesses) {
         const businessUser = req.user.businesses.find(
            (b) => b.businessId === businessId
         );

         if (businessUser && allowedRoles.includes(businessUser.role as any)) {
            return next();
         }
      }

      return sendForbidden(res, ['Insufficient permissions']);
   };
};

export const requireBusinessAccess = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   if (!req.user) {
      return sendUnauthorized(res, ['Authentication required']);
   }

   const businessId =
      req.params.businessId || req.body.businessId || req.query.businessId;

   if (!businessId) {
      return next(); // No business context required
   }

   // Super admin can access any business
   if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
   }

   // Check if user has access to this business
   if (req.user.businesses?.some((b) => b.businessId === businessId)) {
      return next();
   }

   return sendForbidden(res, ['No access to this business']);
};

export const optionalAuth = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
         const token = authHeader.substring(7);

         if (token) {
            try {
               const payload = await AuthService.verifyToken(token);
               req.user = payload;
            } catch (error) {
               // Ignore auth errors for optional auth
            }
         }
      }

      next();
   } catch (error) {
      // Ignore auth errors for optional auth
      next();
   }
};
