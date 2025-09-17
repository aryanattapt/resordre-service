import { Router } from 'express';
import BusinessController from '../controllers/business.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { businessValidation } from '../middleware/businessvalidation.middleware';
import { UserRole } from '../types/auth.type';

const router = Router();

// Business CRUD
router.get(
   '/',
   authenticate,
   businessValidation.getAll,
   BusinessController.getAll
);
router.get(
   '/:id',
   authenticate,
   businessValidation.getOne,
   BusinessController.getOne
);
router.get(
   '/:id/with-users',
   authenticate,
   businessValidation.getOne,
   BusinessController.getWithUsers
);
router.get(
   '/:id/stats',
   authenticate,
   businessValidation.getOne,
   BusinessController.getBusinessStats
);
router.post(
   '/',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER]),
   businessValidation.create,
   BusinessController.create
);
router.put(
   '/:id',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER]),
   businessValidation.update,
   BusinessController.update
);
router.delete(
   '/:id',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER]),
   businessValidation.getOne,
   BusinessController.remove
);
router.patch(
   '/:id/toggle-status',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER]),
   businessValidation.getOne,
   BusinessController.toggleActiveStatus
);

// Business Users Management
router.get(
   '/:id/users',
   authenticate,
   businessValidation.getOne,
   BusinessController.getBusinessUsers
);
router.post(
   '/:id/users',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER]),
   businessValidation.addUser,
   BusinessController.addUser
);
router.put(
   '/:id/users/:userId',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER]),
   businessValidation.updateUserRole,
   BusinessController.updateUserRole
);
router.delete(
   '/:id/users/:userId',
   authenticate,
   authorize([UserRole.ADMIN, UserRole.OWNER, UserRole.MANAGER]),
   businessValidation.removeUser,
   BusinessController.removeUser
);

// User's Businesses
router.get(
   '/user/:userId/businesses',
   authenticate,
   BusinessController.getUserBusinesses
);

export default router;
