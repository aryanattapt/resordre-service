import { Router } from 'express';
import OrderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';

const router = Router();

router.get('/', authenticate, OrderController.getAll);
router.get('/:id', authenticate, [param('id').isUUID()], OrderController.getOne);
router.post('/', authenticate, [body('business_id').isUUID(), body('type').isIn(['dine_in','delivery']), body('orderItems').isArray({ min: 1 })], OrderController.create);
router.put('/:id/status', authenticate, authorize(['admin','staff']), [param('id').isUUID(), body('status').isIn(['pending','in_progress','ready','completed','cancelled'])], OrderController.updateStatus);

export default router;