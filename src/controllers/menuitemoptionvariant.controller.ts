// controllers/menuitemoptionvariant.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import MenuItemOptionVariantService from '../services/menuitemoptionvariant.service';
import {
   sendSuccess,
   sendBadRequest,
   sendNotFound,
   sendInternalServerError,
} from '../utils/response.util';
import {
   CreateOptionVariantDTO,
   UpdateOptionVariantDTO,
} from '../types/menu.type';
import { AppError, NotFoundError, ValidationError } from '../utils/errors.util';

class MenuItemOptionVariantController {
   static async create(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const optionId = req.params.optionId;
         const variantData = { ...req.body, optionId };

         const created = await MenuItemOptionVariantService.create(variantData);
         return sendSuccess(
            res,
            created,
            'Option variant created successfully',
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
            return sendBadRequest(res, ['Option variant ID is required']);
         }

         const dto: UpdateOptionVariantDTO = req.body;
         const updated = await MenuItemOptionVariantService.update(
            req.params.id,
            dto
         );
         return sendSuccess(
            res,
            updated,
            'Option variant updated successfully'
         );
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Option variant not found']);
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
            return sendBadRequest(res, ['Option variant ID is required']);
         }

         await MenuItemOptionVariantService.remove(req.params.id);
         return sendSuccess(
            res,
            undefined,
            'Option variant deleted successfully',
            204
         );
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Option variant not found']);
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

   static async getByOption(req: Request, res: Response) {
      try {
         const optionId = req.params.optionId;
         if (!optionId) {
            return sendBadRequest(res, ['Option ID is required']);
         }

         const variants = await MenuItemOptionVariantService.getByOptionId(
            optionId
         );
         return sendSuccess(
            res,
            variants,
            'Option variants fetched successfully'
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
            return sendBadRequest(res, ['Option variant ID is required']);
         }

         const variant = await MenuItemOptionVariantService.getOne(
            req.params.id
         );
         if (!variant) {
            return sendNotFound(res, ['Option variant not found']);
         }
         return sendSuccess(
            res,
            variant,
            'Option variant fetched successfully'
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
}

export default MenuItemOptionVariantController;
