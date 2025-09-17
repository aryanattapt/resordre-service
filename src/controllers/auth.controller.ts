// controllers/auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import AuthService from '../services/auth.service';
import {
   sendSuccess,
   sendBadRequest,
   sendNotFound,
   sendInternalServerError,
   sendUnauthorized,
} from '../utils/response.util';
import {
   LoginDTO,
   RegisterDTO,
   ChangePasswordDTO,
   ResetPasswordDTO,
   ForgotPasswordDTO,
   RefreshTokenDTO,
   UpdateProfileDTO,
   CreateUserDTO,
   UpdateUserDTO,
   UserFilterDTO,
} from '../types/auth.type';
import {
   AppError,
   NotFoundError,
   ValidationError,
   ConflictError,
} from '../utils/errors.util';

class AuthController {
   static async register(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: RegisterDTO = req.body;
         const user = await AuthService.register(dto);

         // Remove sensitive information
         const { ...userResponse } = user;

         return sendSuccess(
            res,
            userResponse,
            'User registered successfully',
            201
         );
      } catch (err: any) {
         console.error('Registration error:', err);
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Registration failed']);
      }
   }

   static async login(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: LoginDTO = req.body;
         const authResponse = await AuthService.login(dto);

         return sendSuccess(res, authResponse, 'Login successful');
      } catch (err: any) {
         console.error('Login error:', err);
         if (err instanceof ValidationError) {
            return sendUnauthorized(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Login failed']);
      }
   }

   static async refreshToken(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: RefreshTokenDTO = req.body;
         const tokens = await AuthService.refreshToken(dto);

         return sendSuccess(res, tokens, 'Token refreshed successfully');
      } catch (err: any) {
         console.error('Refresh token error:', err);
         if (err instanceof ValidationError) {
            return sendUnauthorized(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Token refresh failed']);
      }
   }

   static async logout(req: Request, res: Response) {
      try {
         const userId = req.user?.userId;
         const refreshToken = req.body.refreshToken;

         if (!userId) {
            return sendUnauthorized(res, ['Authentication required']);
         }

         await AuthService.logout(userId, refreshToken);

         return sendSuccess(res, undefined, 'Logout successful');
      } catch (err: any) {
         console.error('Logout error:', err);
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Logout failed']);
      }
   }

   static async changePassword(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const userId = req.user?.userId;
         if (!userId) {
            return sendUnauthorized(res, ['Authentication required']);
         }

         const dto: ChangePasswordDTO = req.body;
         await AuthService.changePassword(userId, dto);

         return sendSuccess(res, undefined, 'Password changed successfully');
      } catch (err: any) {
         console.error('Change password error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Password change failed']);
      }
   }

   static async forgotPassword(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: ForgotPasswordDTO = req.body;
         await AuthService.forgotPassword(dto);

         return sendSuccess(
            res,
            undefined,
            'If the email exists, a password reset link has been sent'
         );
      } catch (err: any) {
         console.error('Forgot password error:', err);
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Password reset request failed']);
      }
   }

   static async resetPassword(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: ResetPasswordDTO = req.body;
         await AuthService.resetPassword(dto);

         return sendSuccess(res, undefined, 'Password reset successful');
      } catch (err: any) {
         console.error('Reset password error:', err);
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Password reset failed']);
      }
   }

   static async updateProfile(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const userId = req.user?.userId;
         if (!userId) {
            return sendUnauthorized(res, ['Authentication required']);
         }

         const dto: UpdateProfileDTO = req.body;
         const user = await AuthService.updateProfile(userId, dto);

         return sendSuccess(res, user, 'Profile updated successfully');
      } catch (err: any) {
         console.error('Update profile error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Profile update failed']);
      }
   }

   static async getProfile(req: Request, res: Response) {
      try {
         const userId = req.user?.userId;
         if (!userId) {
            return sendUnauthorized(res, ['Authentication required']);
         }

         const user = await AuthService.getUserProfile(userId);

         return sendSuccess(res, user, 'Profile fetched successfully');
      } catch (err: any) {
         console.error('Get profile error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to fetch profile']);
      }
   }

   // Admin endpoints
   static async createUser(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: CreateUserDTO = req.body;
         const user = await AuthService.createUser(dto);

         return sendSuccess(res, user, 'User created successfully', 201);
      } catch (err: any) {
         console.error('Create user error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['User creation failed']);
      }
   }

   static async getUsers(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const filters: UserFilterDTO = {};

         if (req.query.role) filters.role = req.query.role as any;
         if (req.query.isActive !== undefined)
            filters.isActive = req.query.isActive === 'true';
         if (req.query.isVerified !== undefined)
            filters.isVerified = req.query.isVerified === 'true';
         if (req.query.businessId)
            filters.businessId = req.query.businessId as string;
         if (req.query.search) filters.search = req.query.search as string;
         if (req.query.page) filters.page = parseInt(req.query.page as string);
         if (req.query.limit)
            filters.limit = parseInt(req.query.limit as string);
         if (req.query.sortBy) filters.sortBy = req.query.sortBy as any;
         if (req.query.sortOrder)
            filters.sortOrder = req.query.sortOrder as any;

         const result = await AuthService.getUsers(filters);

         return sendSuccess(res, result, 'Users fetched successfully');
      } catch (err: any) {
         console.error('Get users error:', err);
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to fetch users']);
      }
   }

   static async getUserById(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, [' User ID is required']);
         }
         const user = await AuthService.getUserProfile(req.params.id);

         return sendSuccess(res, user, 'User fetched successfully');
      } catch (err: any) {
         console.error('Get user error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to fetch user']);
      }
   }

   static async updateUser(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, [' User ID is required']);
         }

         const dto: UpdateUserDTO = req.body;
         const user = await AuthService.updateUser(req.params.id, dto);

         return sendSuccess(res, user, 'User updated successfully');
      } catch (err: any) {
         console.error('Update user error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['User update failed']);
      }
   }

   static async deleteUser(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, [' User ID is required']);
         }

         await AuthService.deleteUser(req.params.id);

         return sendSuccess(res, undefined, 'User deleted successfully', 204);
      } catch (err: any) {
         console.error('Delete user error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['User deletion failed']);
      }
   }

   static async verifyToken(req: Request, res: Response) {
      try {
         const userId = req.user?.userId;
         if (!userId) {
            return sendUnauthorized(res, ['Authentication required']);
         }

         const user = await AuthService.getUserProfile(userId);

         return sendSuccess(res, { user, valid: true }, 'Token is valid');
      } catch (err: any) {
         console.error('Verify token error:', err);
         return sendUnauthorized(res, ['Invalid token']);
      }
   }
}

export default AuthController;
