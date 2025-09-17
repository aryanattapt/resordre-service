import { Router } from 'express';
import MenuItemController from '../controllers/menuitem.controller';
import MenuItemOptionController from '../controllers/menuitemoption.controller';
import MenuItemOptionVariantController from '../controllers/menuitemoptionvariant.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
   menuItemValidation,
   menuItemOptionValidation,
   menuItemOptionVariantValidation,
} from '../middleware/menuvalidation.middleware';
import { UserRole } from '../types/auth.type';

const router = Router();

// Menu Items
router.get(
   '/',
   authenticate,
   menuItemValidation.getAll,
   MenuItemController.getAll
);
router.get(
   '/:id',
   authenticate,
   menuItemValidation.getOne,
   MenuItemController.getOne
);
router.post(
   '/',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemValidation.create,
   MenuItemController.create
);
router.put(
   '/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemValidation.update,
   MenuItemController.update
);
router.delete(
   '/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemValidation.getOne,
   MenuItemController.remove
);

// Menu Item Options
router.get('/:itemId/options', authenticate, MenuItemOptionController.getAll);
router.get(
   '/options/:id',
   authenticate,
   menuItemOptionValidation.getOne,
   MenuItemOptionController.getOne
);
router.post(
   '/:id/options',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemOptionValidation.create,
   MenuItemOptionController.create
);
router.put(
   '/options/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemOptionValidation.update,
   MenuItemOptionController.update
);
router.delete(
   '/options/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemOptionValidation.delete,
   MenuItemOptionController.remove
);

// Option Variants
router.get(
   '/options/:optionId/variants',
   authenticate,
   MenuItemOptionVariantController.getByOption
);
router.get(
   '/options/variants/:id',
   authenticate,
   MenuItemOptionVariantController.getOne
);
router.post(
   '/options/:optionId/variants',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemOptionVariantValidation.create,
   MenuItemOptionVariantController.create
);
router.put(
   '/options/variants/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuItemOptionVariantValidation.update,
   MenuItemOptionVariantController.update
);
router.delete(
   '/options/variants/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   MenuItemOptionVariantController.remove
);

export default router;
