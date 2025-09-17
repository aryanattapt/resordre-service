// controllers/menucategory.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import MenuCategoryService from '../services/menucategory.service';
import {
   sendSuccess,
   sendBadRequest,
   sendNotFound,
   sendInternalServerError,
} from '../utils/response.util';
import {
   CreateMenuCategoryDTO,
   UpdateMenuCategoryDTO,
} from '../types/menu.type';
import { AppError, NotFoundError } from '../utils/errors.util';

class MenuCategoryController {
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
         const data = await MenuCategoryService.getAll(businessId);
         return sendSuccess(res, data, 'Categories fetched successfully');
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
            return sendBadRequest(res, ['Category ID is required']);
         }

         const category = await MenuCategoryService.getOne(req.params.id);
         if (!category) {
            return sendNotFound(res, ['Category not found']);
         }
         return sendSuccess(res, category, 'Category fetched successfully');
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

   static async getMenuForOrder(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.businessId) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         const businessId = req.params.businessId;
         const menuData = await MenuCategoryService.getMenuForOrder(businessId);
         return sendSuccess(
            res,
            menuData,
            'Menu fetched successfully for order'
         );
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

         const dto: CreateMenuCategoryDTO = req.body;
         const created = await MenuCategoryService.create(dto);
         return sendSuccess(res, created, 'Category created successfully', 201);
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
            return sendBadRequest(res, ['Category ID is required']);
         }

         const dto: UpdateMenuCategoryDTO = req.body;
         const updated = await MenuCategoryService.update(req.params.id, dto);
         return sendSuccess(res, updated, 'Category updated successfully');
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Category not found']);
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
            return sendBadRequest(res, ['Category ID is required']);
         }

         await MenuCategoryService.remove(req.params.id);
         return sendSuccess(
            res,
            undefined,
            'Category deleted successfully',
            204
         );
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Category not found']);
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

export default MenuCategoryController;
