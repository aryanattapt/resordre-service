import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import MenuItemService from '../services/menuitem.service';
import { sendSuccess, sendBadRequest, sendInternalServerError } from '../utils/response.util';

class MenuItemController {
    static async getAll(req: Request, res: Response) {
        try {
            const data = await MenuItemService.getAll();
            return sendSuccess(res, data, 'Menu items fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const item = await MenuItemService.getOne(req.params.id || '');
            if (!item) return sendBadRequest(res, ['Menu item not found']);
            return sendSuccess(res, item, 'Menu item fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const created = await MenuItemService.create(req.body);
            return sendSuccess(res, created, 'Menu item created', 201);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const updated = await MenuItemService.update(req.params.id || '', req.body);
            return sendSuccess(res, updated, 'Menu item updated');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await MenuItemService.remove(req.params.id || '');
            return sendSuccess(res, null, 'Menu item deleted', 204);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }
}

export default MenuItemController;