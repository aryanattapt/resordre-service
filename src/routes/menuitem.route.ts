import { Router } from 'express';
import MenuItemController from '../controllers/menuitem.controller';
import MenuItemOptionController from '../controllers/menuitemoption.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';

const router = Router();

router.get('/', authenticate, MenuItemController.getAll);
router.get('/:id', authenticate, [param('id').isUUID()], MenuItemController.getOne);
router.post('/', authenticate, authorize(['admin']), [body('business_id').isUUID(), body('category_id').isUUID(), body('item_name').notEmpty(), body('price').isNumeric()], MenuItemController.create);
router.put('/:id', authenticate, authorize(['admin']), [param('id').isUUID()], MenuItemController.update);
router.delete('/:id', authenticate, authorize(['admin']), [param('id').isUUID()], MenuItemController.remove);

// Options
router.post('/:id/options', authenticate, authorize(['admin']), [param('id').isUUID(), body('name').notEmpty(), body('price').isNumeric()], MenuItemOptionController.create);
router.delete('/options/:id', authenticate, authorize(['admin']), [param('id').isUUID()], MenuItemOptionController.remove);

export default router;