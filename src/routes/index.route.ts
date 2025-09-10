import { Router } from 'express';
import helloRoute from './hello.route';
import { sendNotFound } from '../utils/response.util';

const router = Router();

router.use('/hello', helloRoute);

// Catch-all for unregistered routes (404)
router.use((req, res) => {
    return sendNotFound(res, [`Cannot ${req.method} ${req.originalUrl}`], "The requested resource was not found.");
});

export default router;