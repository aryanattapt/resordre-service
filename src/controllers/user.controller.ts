import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import UserService from '../services/user.service';
import { sendSuccess, sendBadRequest, sendInternalServerError } from '../utils/response.util';

class UserController {
    static async getAll(req: Request, res: Response) {
        try {
            const users = await UserService.getAll();
            return sendSuccess(res, users, 'Users fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const user = await UserService.getOne(req.params.id || '');
            if (!user) return sendBadRequest(res, ['User not found']);
            return sendSuccess(res, user, 'User fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const updated = await UserService.update(req.params.id || '', req.body);
            return sendSuccess(res, updated, 'User updated');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await UserService.remove(req.params.id || '');
            return sendSuccess(res, null, 'User deleted', 204);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }
}

export default UserController;