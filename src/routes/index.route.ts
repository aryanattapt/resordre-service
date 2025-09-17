import { Router } from 'express';
import helloRoute from './hello.route';
import menuCategoryRoutes from './menucategory.route';
import menuItemRoutes from './menuitem.route';
import orderRoutes from './order.route';
import authRoutes from './auth.route';
import { sendNotFound } from '../utils/response.util';
import businessRoutes from './business.route';

const router = Router();

router.use('/hello', helloRoute);
router.use('/auth', authRoutes);
router.use('/menucategory', menuCategoryRoutes);
router.use('/menuitem', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/businesses', businessRoutes);

// Catch-all for unregistered routes (404)
router.use((req, res) => {
   return sendNotFound(
      res,
      [`Cannot ${req.method} ${req.originalUrl}`],
      'The requested resource was not found.'
   );
});

export default router;
