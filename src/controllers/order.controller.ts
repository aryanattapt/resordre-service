import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import OrderService from '../services/order.service';
import { sendSuccess, sendBadRequest, sendInternalServerError } from '../utils/response.util';

class OrderController {
    static async getAll(req: Request, res: Response) {
        try {
            const data = await OrderService.getAll();
            return sendSuccess(res, data, 'Orders fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const item = await OrderService.getOne(req.params.id || '');
            if (!item) return sendBadRequest(res, ['Order not found']);
            return sendSuccess(res, item, 'Order fetched');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const created = await OrderService.create(req.body);
            return sendSuccess(res, created, 'Order created', 201);
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return sendBadRequest(res, errors.array().map(e => e.msg));
            const updated = await OrderService.updateStatus(req.params.id || '', req.body.status);
            return sendSuccess(res, updated, 'Order status updated');
        } catch (err: any) {
            return sendInternalServerError(res, [String(err.message || err)]);
        }
    }
}

export default OrderController;