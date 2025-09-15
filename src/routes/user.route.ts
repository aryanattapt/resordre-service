import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { param, body } from 'express-validator';

const router = Router();

router.get('/', authenticate, authorize(['admin']), UserController.getAll);
router.get('/:id', authenticate, [param('id').isUUID().withMessage('Invalid id')], UserController.getOne);
router.put('/:id', authenticate, [param('id').isUUID().withMessage('Invalid id'), body('fullname').optional().isString()], UserController.update);
router.delete('/:id', authenticate, authorize(['admin']), [param('id').isUUID().withMessage('Invalid id')], UserController.remove);

export default router;