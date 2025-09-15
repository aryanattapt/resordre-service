import { Request, Response } from 'express';
import MenuItemOptionService from '../services/menuitemoption.service';
import { sendSuccess, sendBadRequest, sendInternalServerError } from '../utils/response.util';
import { validationResult } from 'express-validator';

class MenuItemOptionController {
    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const created = await MenuItemOptionService.create(req.body);
            return sendSuccess(res, created, 'Option created', 201);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await MenuItemOptionService.remove(req.params.id || '');
            return sendSuccess(res, null, 'Option deleted', 204);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }
}

export default MenuItemOptionController;