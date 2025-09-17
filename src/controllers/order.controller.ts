// controllers/order.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import OrderService from '../services/order.service';
import {
   sendSuccess,
   sendBadRequest,
   sendNotFound,
   sendInternalServerError,
} from '../utils/response.util';
import {
   CreateOrderDTO,
   UpdateOrderDTO,
   CreatePaymentDTO,
   OrderFilterDTO,
} from '../types/order.type';
import {
   AppError,
   NotFoundError,
   ValidationError,
   ConflictError,
} from '../utils/errors.util';

class OrderController {
   static async create(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         // Validate order items array
         if (
            !req.body.orderItems ||
            !Array.isArray(req.body.orderItems) ||
            req.body.orderItems.length === 0
         ) {
            return sendBadRequest(res, ['At least one order item is required']);
         }

         // Validate each order item
         for (const item of req.body.orderItems) {
            if (!item.itemId || !item.quantity || item.quantity < 1) {
               return sendBadRequest(res, [
                  'Each order item must have a valid itemId and quantity >= 1',
               ]);
            }

            if (item.options && Array.isArray(item.options)) {
               for (const option of item.options) {
                  if (
                     !option.optionId ||
                     !option.variants ||
                     !Array.isArray(option.variants)
                  ) {
                     return sendBadRequest(res, ['Invalid option structure']);
                  }

                  for (const variant of option.variants) {
                     if (!variant.variantId) {
                        return sendBadRequest(res, [
                           'Each variant must have a valid variantId',
                        ]);
                     }
                  }
               }
            }
         }

         const dto: CreateOrderDTO = {
            ...req.body,
            discount: req.body.discount || 0,
            tipAmount: req.body.tipAmount || 0,
         };

         const created = await OrderService.create(dto);
         return sendSuccess(res, created, 'Order created successfully', 201);
      } catch (err: any) {
         console.error('Order creation error:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [
            'Failed to create order. Please try again.',
         ]);
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

         const filters: OrderFilterDTO = {};

         // Safely parse query parameters
         if (req.query.businessId)
            filters.businessId = req.query.businessId as string;
         if (req.query.status) filters.status = req.query.status as any;
         if (req.query.type) filters.type = req.query.type as any;
         if (req.query.paymentStatus)
            filters.paymentStatus = req.query.paymentStatus as any;
         if (req.query.tableId) filters.tableId = req.query.tableId as string;
         if (req.query.customerId)
            filters.customerId = req.query.customerId as string;
         if (req.query.search) filters.search = req.query.search as string;

         if (req.query.dateFrom) {
            const dateFrom = new Date(req.query.dateFrom as string);
            if (!isNaN(dateFrom.getTime())) {
               filters.dateFrom = dateFrom;
            }
         }

         if (req.query.dateTo) {
            const dateTo = new Date(req.query.dateTo as string);
            if (!isNaN(dateTo.getTime())) {
               filters.dateTo = dateTo;
            }
         }

         if (req.query.page) {
            const page = parseInt(req.query.page as string);
            if (!isNaN(page) && page > 0) {
               filters.page = page;
            }
         }

         if (req.query.limit) {
            const limit = parseInt(req.query.limit as string);
            if (!isNaN(limit) && limit > 0 && limit <= 100) {
               filters.limit = limit;
            }
         }

         if (req.query.sortBy) filters.sortBy = req.query.sortBy as any;
         if (req.query.sortOrder)
            filters.sortOrder = req.query.sortOrder as any;

         const result = await OrderService.getAll(filters);
         return sendSuccess(res, result, 'Orders fetched successfully');
      } catch (err: any) {
         console.error('Error fetching orders:', err);
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to fetch orders']);
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
            return sendBadRequest(res, ['Order ID is required']);
         }

         const order = await OrderService.getOne(req.params.id);
         if (!order) {
            return sendNotFound(res, ['Order not found']);
         }
         return sendSuccess(res, order, 'Order fetched successfully');
      } catch (err: any) {
         console.error('Error fetching order:', err);
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to fetch order']);
      }
   }

   static async getByOrderNumber(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.businessId) {
            return sendBadRequest(res, ['businessId is required']);
         }

         if (!req.params.orderNumber) {
            return sendBadRequest(res, ['Order number is required']);
         }

         const order = await OrderService.getByOrderNumber(
            req.params.businessId,
            req.params.orderNumber
         );
         if (!order) {
            return sendNotFound(res, ['Order not found']);
         }
         return sendSuccess(res, order, 'Order fetched successfully');
      } catch (err: any) {
         console.error('Error fetching order by number:', err);
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to fetch order']);
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
            return sendBadRequest(res, ['Order ID is required']);
         }

         const dto: UpdateOrderDTO = req.body;
         const updated = await OrderService.update(req.params.id, dto);
         return sendSuccess(res, updated, 'Order updated successfully');
      } catch (err: any) {
         console.error('Error updating order:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to update order']);
      }
   }

   static async cancel(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.id) {
            return sendBadRequest(res, ['Order ID is required']);
         }

         const order = await OrderService.cancel(
            req.params.id,
            req.body.reason
         );
         return sendSuccess(res, order, 'Order cancelled successfully');
      } catch (err: any) {
         console.error('Error cancelling order:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to cancel order']);
      }
   }

   static async addPayment(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         // Validate payment amount
         if (
            !req.body.amount ||
            isNaN(req.body.amount) ||
            req.body.amount <= 0
         ) {
            return sendBadRequest(res, ['Valid payment amount is required']);
         }

         const dto: CreatePaymentDTO = {
            amount: parseFloat(req.body.amount),
            paymentMethod: req.body.paymentMethod,
            transactionId: req.body.transactionId,
            reference: req.body.reference,
         };

         if (!req.params.id) {
            return sendBadRequest(res, ['Order ID is required']);
         }

         const payment = await OrderService.addPayment(req.params.id, dto);
         return sendSuccess(res, payment, 'Payment added successfully', 201);
      } catch (err: any) {
         console.error('Error adding payment:', err);
         if (err instanceof NotFoundError) {
            return sendNotFound(res, [err.message]);
         }
         if (err instanceof ValidationError) {
            return sendBadRequest(res, [err.message]);
         }
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, ['Failed to add payment']);
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

         let dateFrom: Date | undefined;
         let dateTo: Date | undefined;

         if (req.query.dateFrom) {
            dateFrom = new Date(req.query.dateFrom as string);
            if (isNaN(dateFrom.getTime())) {
               return sendBadRequest(res, ['Invalid dateFrom format']);
            }
         }

         if (req.query.dateTo) {
            dateTo = new Date(req.query.dateTo as string);
            if (isNaN(dateTo.getTime())) {
               return sendBadRequest(res, ['Invalid dateTo format']);
            }
         }

         if (!req.params.businessId) {
            return sendBadRequest(res, ['businessId is required']);
         }

         const stats = await OrderService.getBusinessStats(
            req.params.businessId,
            dateFrom,
            dateTo
         );
         return sendSuccess(
            res,
            stats,
            'Business statistics fetched successfully'
         );
      } catch (err: any) {
         console.error('Error fetching business stats:', err);
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [
            'Failed to fetch business statistics',
         ]);
      }
   }

   static async getDashboardStats(req: Request, res: Response) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return sendBadRequest(
               res,
               errors.array().map((e) => e.msg)
            );
         }

         if (!req.params.businessId) {
            return sendBadRequest(res, ['businessId is required']);
         }

         const stats = await OrderService.getDashboardStats(
            req.params.businessId
         );
         return sendSuccess(
            res,
            stats,
            'Dashboard statistics fetched successfully'
         );
      } catch (err: any) {
         console.error('Error fetching dashboard stats:', err);
         if (err instanceof AppError) {
            return sendBadRequest(res, [err.message]);
         }
         return sendInternalServerError(res, [
            'Failed to fetch dashboard statistics',
         ]);
      }
   }
}

export default OrderController;
