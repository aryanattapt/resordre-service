import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = Router();

router.post('/register', [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('user_name').notEmpty().withMessage('user_name is required'),
    body('fullname').notEmpty().withMessage('fullname is required'),
], AuthController.register);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
], AuthController.login);

export default router;