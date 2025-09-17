import { Router } from 'express';
import MenuCategoryController from '../controllers/menucategory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { menuCategoryValidation } from '../middleware/menuvalidation.middleware';
import { UserRole } from '../types/auth.type';

const router = Router();

router.get(
   '/',
   authenticate,
   menuCategoryValidation.getAll,
   MenuCategoryController.getAll
);
router.get(
   '/menu/:businessId',
   authenticate,
   menuCategoryValidation.getMenuForOrder,
   MenuCategoryController.getMenuForOrder
);
router.get(
   '/:id',
   authenticate,
   menuCategoryValidation.getOne,
   MenuCategoryController.getOne
);
router.post(
   '/',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuCategoryValidation.create,
   MenuCategoryController.create
);
router.put(
   '/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuCategoryValidation.update,
   MenuCategoryController.update
);
router.delete(
   '/:id',
   authenticate,
   authorize([UserRole.ADMIN]),
   menuCategoryValidation.getOne,
   MenuCategoryController.remove
);

export default router;
