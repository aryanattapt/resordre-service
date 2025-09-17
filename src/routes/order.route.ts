// routes/order.route.ts
import { Router } from 'express';
import OrderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { orderValidation } from '../middleware/ordervalidation.middleware';
import { UserRole } from '../types/auth.type';

const router = Router();

// Order CRUD
router.get('/', authenticate, orderValidation.getAll, OrderController.getAll);
router.get(
   '/:id',
   authenticate,
   orderValidation.getOne,
   OrderController.getOne
);
router.get(
   '/business/:businessId/order-number/:orderNumber',
   authenticate,
   orderValidation.getByOrderNumber,
   OrderController.getByOrderNumber
);
router.post('/', authenticate, orderValidation.create, OrderController.create);
router.put(
   '/:id',
   authenticate,
   authorize([
      UserRole.ADMIN,
      UserRole.OWNER,
      UserRole.MANAGER,
      UserRole.STAFF,
   ]),
   orderValidation.update,
   OrderController.update
);
router.post(
   '/:id/cancel',
   authenticate,
   authorize([
      UserRole.ADMIN,
      UserRole.OWNER,
      UserRole.MANAGER,
      UserRole.STAFF,
   ]),
   orderValidation.cancel,
   OrderController.cancel
);

// Payments
router.post(
   '/:id/payments',
   authenticate,
   authorize([
      UserRole.ADMIN,
      UserRole.OWNER,
      UserRole.MANAGER,
      UserRole.STAFF,
   ]),
   orderValidation.addPayment,
   OrderController.addPayment
);

// Statistics
router.get(
   '/business/:businessId/stats',
   authenticate,
   orderValidation.getStats,
   OrderController.getBusinessStats
);
router.get(
   '/business/:businessId/dashboard',
   authenticate,
   orderValidation.getStats,
   OrderController.getDashboardStats
);

export default router;
