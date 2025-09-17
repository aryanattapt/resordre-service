// controllers/menuitem.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import MenuItemService from '../services/menuitem.service';
import {
   sendSuccess,
   sendBadRequest,
   sendNotFound,
   sendInternalServerError,
} from '../utils/response.util';
import { CreateMenuItemDTO, UpdateMenuItemDTO } from '../types/menu.type';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.util';

class MenuItemController {
   static async getAll(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const businessId = req.query.businessId as string;
         const categoryId = req.query.categoryId as string;

         const data = await MenuItemService.getAll(businessId, categoryId);
         return sendSuccess(res, data, 'Menu items fetched successfully');
      } catch (err: any) {
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [String(err.message || err)]);
      }
   }

   static async getOne(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Menu item ID is required']);
         }

         const item = await MenuItemService.getOne(req.params.id);
         if (!item) {
            return sendNotFound(res, ['Menu item not found']);
         }
         return sendSuccess(res, item, 'Menu item fetched successfully');
      } catch (err: any) {
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [String(err.message || err)]);
      }
   }

   static async create(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: CreateMenuItemDTO = req.body;
         const created = await MenuItemService.create(dto);
         return sendSuccess(
            res,
            created,
            'Menu item created successfully',
            201
         );
      } catch (err: any) {
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [String(err.message || err)]);
      }
   }

   static async update(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Menu item ID is required']);
         }

         const dto: UpdateMenuItemDTO = req.body;
         const updated = await MenuItemService.update(req.params.id, dto);
         return sendSuccess(res, updated, 'Menu item updated successfully');
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Menu item not found']);
         }
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [String(err.message || err)]);
      }
   }

   static async remove(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Menu item ID is required']);
         }

         await MenuItemService.remove(req.params.id);
         return sendSuccess(
            res,
            undefined,
            'Menu item deleted successfully',
            204
         );
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Menu item not found']);
         }
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [String(err.message || err)]);
      }
   }
}

export default MenuItemController;
