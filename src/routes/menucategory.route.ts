import { Router } from 'express';
import MenuCategoryController from '../controllers/menucategory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';

const router = Router();

router.get('/', authenticate, MenuCategoryController.getAll);
router.get('/:id', authenticate, [param('id').isUUID()], MenuCategoryController.getOne);
router.post('/', authenticate, authorize(['admin']), [body('business_id').isUUID(), body('category_name').notEmpty()], MenuCategoryController.create);
router.put('/:id', authenticate, authorize(['admin']), [param('id').isUUID()], MenuCategoryController.update);
router.delete('/:id', authenticate, authorize(['admin']), [param('id').isUUID()], MenuCategoryController.remove);

export default router;