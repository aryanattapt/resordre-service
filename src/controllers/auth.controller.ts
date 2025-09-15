import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import AuthService from '../services/auth.service';
import { sendBadRequest, sendSuccess, sendInternalServerError } from '../utils/response.util';

class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));

            const user = await AuthService.register(req.body);
            return sendSuccess(res, user, 'User registered', 201);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));

            const token = await AuthService.login(req.body);
            return sendSuccess(res, { token }, 'Login successful');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }
}

export default AuthController;