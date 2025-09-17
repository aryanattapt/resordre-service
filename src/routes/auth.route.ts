// routes/auth.route.ts
import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { authValidation } from '../middleware/authvalidation.middleware';
import { UserRole } from '../types/auth.type';

const router = Router();

// Public routes
router.post('/register', authValidation.register, AuthController.register);
router.post('/login', authValidation.login, AuthController.login);
router.post(
   '/refresh',
   authValidation.refreshToken,
   AuthController.refreshToken
);
router.post(
   '/forgot-password',
   authValidation.forgotPassword,
   AuthController.forgotPassword
);
router.post(
   '/reset-password',
   authValidation.resetPassword,
   AuthController.resetPassword
);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post(
   '/change-password',
   authenticate,
   authValidation.changePassword,
   AuthController.changePassword
);
router.get('/profile', authenticate, AuthController.getProfile);
router.put(
   '/profile',
   authenticate,
   authValidation.updateProfile,
   AuthController.updateProfile
);
router.get('/verify', authenticate, AuthController.verifyToken);

// Admin routes
router.post(
   '/users',
   authenticate,
   authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
   authValidation.createUser,
   AuthController.createUser
);
router.get(
   '/users',
   authenticate,
   authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
   authValidation.getUsers,
   AuthController.getUsers
);
router.get(
   '/users/:id',
   authenticate,
   authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
   authValidation.getUserById,
   AuthController.getUserById
);
router.put(
   '/users/:id',
   authenticate,
   authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
   authValidation.updateUser,
   AuthController.updateUser
);
router.delete(
   '/users/:id',
   authenticate,
   authorize([UserRole.SUPER_ADMIN]),
   authValidation.getUserById,
   AuthController.deleteUser
);

export default router;
