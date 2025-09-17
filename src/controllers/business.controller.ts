import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import BusinessService from '../services/business.service';
import {
   sendSuccess,
   sendBadRequest,
   sendNotFound,
   sendInternalServerError,
} from '../utils/response.util';
import {
   CreateBusinessDTO,
   UpdateBusinessDTO,
   AddUserToBusinessDTO,
   UpdateUserRoleDTO,
   BusinessFilterDTO,
} from '../types/business.type';
import {
   AppError,
   NotFoundError,
   ValidationError,
   ConflictError,
} from '../utils/errors.util';

class BusinessController {
   static async create(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const dto: CreateBusinessDTO = req.body;
         const created = await BusinessService.create(dto);
         return sendSuccess(res, created, 'Business created successfully', 201);
      } catch (err: any) {
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
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

   static async getAll(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         const filters: BusinessFilterDTO = {
            isActive: req.query.isActive ? req.query.isActive === 'true' : true,
            businessType: req.query.businessType as any,
            ownerId: req.query.ownerId as string,
            search: req.query.search as string,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
         };

         const result = await BusinessService.getAll(filters);
         return sendSuccess(res, result, 'Businesses fetched successfully');
      } catch (err: any) {
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
            return sendBadRequest(res, ['Business ID is required']);
         }

         const business = await BusinessService.getOne(req.params.id);
         if (!business) {
            return sendNotFound(res, ['Business not found']);
         }
         return sendSuccess(res, business, 'Business fetched successfully');
      } catch (err: any) {
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [String(err.message || err)]);
      }
   }

   static async getWithUsers(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         const business = await BusinessService.getWithUsers(req.params.id);
         if (!business) {
            return sendNotFound(res, ['Business not found']);
         }
         return sendSuccess(
            res,
            business,
            'Business with users fetched successfully'
         );
      } catch (err: any) {
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
            return sendBadRequest(res, ['Business ID is required']);
         }

         const dto: UpdateBusinessDTO = req.body;
         const updated = await BusinessService.update(req.params.id, dto);
         return sendSuccess(res, updated, 'Business updated successfully');
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Business not found']);
         }
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
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
            return sendBadRequest(res, ['Business ID is required']);
         }

         await BusinessService.remove(req.params.id);
         return sendSuccess(
            res,
            undefined,
            'Business deleted successfully',
            204
         );
      } catch (err: any) {
         if (err.code === 'P2025') {
            return sendNotFound(res, ['Business not found']);
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

   static async addUser(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         const dto: AddUserToBusinessDTO = req.body;
         const businessUser = await BusinessService.addUser(req.params.id, dto);
         return sendSuccess(
            res,
            businessUser,
            'User added to business successfully',
            201
         );
      } catch (err: any) {
         if (err instanceof ConflictError) {
            return sendBadRequest(res, [err.message]);
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

   static async updateUserRole(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         if (!req.params.userId) {
            return sendBadRequest(res, ['User ID is required']);
         }

         const dto: UpdateUserRoleDTO = req.body;
         const businessUser = await BusinessService.updateUserRole(
            req.params.id,
            req.params.userId,
            dto
         );
         return sendSuccess(
            res,
            businessUser,
            'User role updated successfully'
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

   static async removeUser(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         if (!req.params.userId) {
            return sendBadRequest(res, ['User ID is required']);
         }

         await BusinessService.removeUser(req.params.id, req.params.userId);
         return sendSuccess(
            res,
            undefined,
            'User removed from business successfully',
            204
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

   static async getBusinessUsers(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         const users = await BusinessService.getBusinessUsers(req.params.id);
         return sendSuccess(res, users, 'Business users fetched successfully');
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

   static async getUserBusinesses(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.userId) {
            return sendBadRequest(res, ['User ID is required']);
         }

         const businesses = await BusinessService.getUserBusinesses(
            req.params.userId
         );
         return sendSuccess(
            res,
            businesses,
            'User businesses fetched successfully'
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

   static async getBusinessStats(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         const stats = await BusinessService.getBusinessStats(req.params.id);
         return sendSuccess(
            res,
            stats,
            'Business statistics fetched successfully'
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

   static async toggleActiveStatus(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Business ID is required']);
         }

         const business = await BusinessService.toggleActiveStatus(
            req.params.id
         );
         return sendSuccess(
            res,
            business,
            'Business status toggled successfully'
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

export default BusinessController;
