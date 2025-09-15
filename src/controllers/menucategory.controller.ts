import { Request, Response } from 'express';
import MenuCategoryService from '../services/menucategory.service';
import { validationResult } from 'express-validator';
import { sendSuccess, sendBadRequest, sendInternalServerError } from '../utils/response.util';

class MenuCategoryController {
    static async getAll(req: Request, res: Response) {
        try {
            const data = await MenuCategoryService.getAll();
            return sendSuccess(res, data, 'Categories fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const item = await MenuCategoryService.getOne(req.params.id || '');
            if (!item) return sendBadRequest(res, ['Category not found']);
            return sendSuccess(res, item, 'Category fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const created = await MenuCategoryService.create(req.body);
            return sendSuccess(res, created, 'Category created', 201);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const updated = await MenuCategoryService.update(req.params.id || '', req.body);
            return sendSuccess(res, updated, 'Category updated');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async remove(req: Request, res: Response) {
        try {
            await MenuCategoryService.remove(req.params.id || '');
            return sendSuccess(res, null, 'Category deleted', 204);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }
}

export default MenuCategoryController;