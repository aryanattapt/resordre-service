// services/order.service.ts
import { PrismaClient, Prisma } from '@prisma/client';
import {
   Order,
   OrderSummary,
   OrderItem,
   OrderItemOption,
   OrderItemOptionVariant,
   Payment,
   CreateOrderDTO,
   UpdateOrderDTO,
   CreatePaymentDTO,
   OrderFilterDTO,
   OrderStats,
   DashboardStats,
   OrderType,
   OrderStatus,
   PaymentStatus,
   PaymentMethod,
} from '../types/order.type';
import {
   NotFoundError,
   ValidationError,
   ConflictError,
} from '../utils/errors.util';

const prisma = new PrismaClient();

class OrderService {
   // Mapping functions with proper error handling
   static mapOrderItemOptionVariantToDomain(db: any): OrderItemOptionVariant {
      if (!db) return {} as OrderItemOptionVariant;

      return {
         id: db.id || '',
         variantId: db.variant_id || '',
         variantName: db.variant_name || '',
         variantPrice: db.variant_price ? Number(db.variant_price) : 0,
      };
   }

   static mapOrderItemOptionToDomain(db: any): OrderItemOption {
      if (!db) return {} as OrderItemOption;

      return {
         id: db.id || '',
         optionId: db.option_id || '',
         optionName: db.option_name || '',
         variants: Array.isArray(db.variants)
            ? db.variants.map(this.mapOrderItemOptionVariantToDomain)
            : [],
      };
   }

   static mapOrderItemToDomain(db: any): OrderItem {
      if (!db) return {} as OrderItem;

      return {
         orderItemId: db.order_item_id || '',
         itemId: db.item_id || '',
         itemName: db.item_name || '',
         basePrice: db.base_price ? Number(db.base_price) : 0,
         quantity: db.quantity || 0,
         totalPrice: db.total_price ? Number(db.total_price) : 0,
         specialInstructions: db.special_instructions || undefined,
         options: Array.isArray(db.options)
            ? db.options.map(this.mapOrderItemOptionToDomain)
            : [],
      };
   }

   static mapPaymentToDomain(db: any): Payment {
      if (!db) return {} as Payment;

      return {
         paymentId: db.payment_id || '',
         orderId: db.order_id || '',
         amount: db.amount ? Number(db.amount) : 0,
         paymentMethod:
            (db.payment_method as PaymentMethod) || PaymentMethod.CASH,
         status: (db.status as PaymentStatus) || PaymentStatus.PENDING,
         transactionId: db.transaction_id || undefined,
         reference: db.reference || undefined,
         processedAt: db.processed_at || undefined,
         createdAt: db.created_at || new Date(),
      };
   }

   static mapOrderToDomain(db: any): Order {
      if (!db) return {} as Order;

      return {
         orderId: db.order_id || '',
         businessId: db.business_id || '',
         tableId: db.table_id || undefined,
         customerId: db.customer_id || undefined,
         customerName: db.customer_name || undefined,
         customerPhone: db.customer_phone || undefined,
         orderNumber: db.order_number || '',
         type: (db.type as OrderType) || OrderType.DINE_IN,
         status: (db.status as OrderStatus) || OrderStatus.PENDING,
         subtotal: db.subtotal ? Number(db.subtotal) : 0,
         tax: db.tax ? Number(db.tax) : 0,
         deliveryFee: db.delivery_fee ? Number(db.delivery_fee) : 0,
         discount: db.discount ? Number(db.discount) : 0,
         tipAmount: db.tip_amount ? Number(db.tip_amount) : 0,
         grandTotal: db.grand_total ? Number(db.grand_total) : 0,
         paymentStatus:
            (db.payment_status as PaymentStatus) || PaymentStatus.PENDING,
         paymentMethod: db.payment_method || undefined,
         notes: db.notes || undefined,
         estimatedTime: db.estimated_time || undefined,
         createdAt: db.created_at || new Date(),
         updatedAt: db.updated_at || new Date(),
         orderItems: Array.isArray(db.orderItems)
            ? db.orderItems.map(this.mapOrderItemToDomain)
            : [],
         payments: Array.isArray(db.payments)
            ? db.payments.map(this.mapPaymentToDomain)
            : [],
      };
   }

   static mapOrderSummaryToDomain(db: any): OrderSummary {
      if (!db) return {} as OrderSummary;

      return {
         orderId: db.order_id || '',
         orderNumber: db.order_number || '',
         customerName: db.customer_name || undefined,
         type: (db.type as OrderType) || OrderType.DINE_IN,
         status: (db.status as OrderStatus) || OrderStatus.PENDING,
         grandTotal: db.grand_total ? Number(db.grand_total) : 0,
         paymentStatus:
            (db.payment_status as PaymentStatus) || PaymentStatus.PENDING,
         estimatedTime: db.estimated_time || undefined,
         createdAt: db.created_at || new Date(),
         itemCount: db._count?.orderItems || 0,
      };
   }

   private static async generateOrderNumber(
      businessId: string
   ): Promise<string> {
      try {
         return await prisma.$transaction(async (tx) => {
            const business = await tx.business.findUnique({
               where: { business_id: businessId },
            });

            if (!business) {
               throw new NotFoundError('Business');
            }

            const updated = await tx.business.update({
               where: { business_id: businessId },
               data: {
                  order_counter: { increment: 1 },
               },
            });

            return `#${updated.order_counter.toString().padStart(4, '0')}`;
         });
      } catch (error) {
         console.error('Error generating order number:', error);
         throw new ValidationError('Failed to generate order number');
      }
   }

   private static async calculateOrderTotals(
      businessId: string,
      orderItems: any[],
      discount: number = 0,
      tipAmount: number = 0,
      deliveryFee: number = 0
   ) {
      try {
         // Get business tax rate
         const business = await prisma.business.findUnique({
            where: { business_id: businessId },
         });

         if (!business) {
            throw new NotFoundError('Business');
         }

         const taxRate = business.tax_rate ? Number(business.tax_rate) : 0;
         let subtotal = 0;

         // Calculate subtotal from order items
         for (const orderItem of orderItems) {
            const itemTotal = Number(orderItem.total_price || 0);
            if (isNaN(itemTotal)) {
               throw new ValidationError('Invalid item price calculation');
            }
            subtotal += itemTotal;
         }

         const tax = subtotal * taxRate;
         const grandTotal = subtotal + tax + deliveryFee - discount + tipAmount;

         return {
            subtotal: Math.round(subtotal * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            grandTotal: Math.max(0, Math.round(grandTotal * 100) / 100),
         };
      } catch (error) {
         console.error('Error calculating order totals:', error);
         throw error instanceof NotFoundError
            ? error
            : new ValidationError('Failed to calculate order totals');
      }
   }

   static async create(data: CreateOrderDTO): Promise<Order> {
      try {
         return await prisma.$transaction(async (tx) => {
            // Validate business exists
            const business = await tx.business.findUnique({
               where: { business_id: data.businessId },
            });

            if (!business) {
               throw new NotFoundError('Business');
            }

            // Validate all menu items exist and are available
            const menuItemIds = data.orderItems.map((item) => item.itemId);
            const menuItems = await tx.menuItem.findMany({
               where: {
                  item_id: { in: menuItemIds },
                  business_id: data.businessId,
                  is_available: true,
               },
               include: {
                  options: {
                     include: {
                        variants: {
                           where: { is_available: true },
                        },
                     },
                  },
               },
            });

            if (menuItems.length !== menuItemIds.length) {
               throw new ValidationError(
                  'One or more menu items are not available'
               );
            }

            // Create order items with calculated prices
            const orderItemsData = [];
            for (const orderItemDto of data.orderItems) {
               const menuItem = menuItems.find(
                  (mi) => mi.item_id === orderItemDto.itemId
               );
               if (!menuItem) {
                  throw new ValidationError(
                     `Menu item ${orderItemDto.itemId} not found`
                  );
               }

               const basePrice = Number(menuItem.price);
               if (isNaN(basePrice) || basePrice < 0) {
                  throw new ValidationError(
                     `Invalid price for item ${menuItem.item_name}`
                  );
               }

               let itemTotal = basePrice * orderItemDto.quantity;

               // Calculate option prices
               const optionsData = [];
               for (const optionDto of orderItemDto.options || []) {
                  const menuOption = menuItem.options.find(
                     (o) => o.option_id === optionDto.optionId
                  );
                  if (!menuOption) {
                     console.warn(
                        `Option ${optionDto.optionId} not found for item ${menuItem.item_name}`
                     );
                     continue;
                  }

                  const variantsData = [];
                  for (const variantDto of optionDto.variants || []) {
                     const variant = menuOption.variants.find(
                        (v) => v.variant_id === variantDto.variantId
                     );
                     if (variant && variant.is_available) {
                        const variantPrice = Number(variant.price);
                        if (!isNaN(variantPrice) && variantPrice >= 0) {
                           itemTotal += variantPrice * orderItemDto.quantity;

                           variantsData.push({
                              variant_id: variant.variant_id,
                              variant_name: variant.variant_name,
                              variant_price: variantPrice,
                           });
                        }
                     }
                  }

                  if (variantsData.length > 0) {
                     optionsData.push({
                        option_id: menuOption.option_id,
                        option_name: menuOption.name,
                        variants: variantsData,
                     });
                  }
               }

               orderItemsData.push({
                  item_id: menuItem.item_id,
                  item_name: menuItem.item_name,
                  base_price: basePrice,
                  quantity: orderItemDto.quantity,
                  total_price: Math.round(itemTotal * 100) / 100,
                  special_instructions:
                     orderItemDto.specialInstructions || null,
                  options: optionsData,
               });
            }

            // Calculate delivery fee
            const deliveryFee = data.type === OrderType.DELIVERY ? 5.0 : 0.0;

            // Calculate totals
            const { subtotal, tax, grandTotal } =
               await this.calculateOrderTotals(
                  data.businessId,
                  orderItemsData,
                  data.discount || 0,
                  data.tipAmount || 0,
                  deliveryFee
               );

            // Generate order number
            const orderNumber = await this.generateOrderNumber(data.businessId);

            // Create order with nested data
            const orderData: Prisma.OrderCreateInput = {
               business: { connect: { business_id: data.businessId } },
               table_id: data.tableId || null,
               customer_id: data.customerId || null,
               customer_name: data.customerName || null,
               customer_phone: data.customerPhone || null,
               order_number: orderNumber,
               type: data.type,
               status: OrderStatus.PENDING,
               subtotal: new Prisma.Decimal(subtotal),
               tax: new Prisma.Decimal(tax),
               delivery_fee: new Prisma.Decimal(deliveryFee),
               discount: new Prisma.Decimal(data.discount || 0),
               tip_amount: new Prisma.Decimal(data.tipAmount || 0),
               grand_total: new Prisma.Decimal(grandTotal + deliveryFee),
               payment_status: PaymentStatus.PENDING,
               notes: data.notes || null,
               estimated_time: data.estimatedTime || null,
               orderItems: {
                  create: orderItemsData.map((item) => ({
                     item: { connect: { item_id: item.item_id } },
                     item_name: item.item_name,
                     base_price: new Prisma.Decimal(item.base_price),
                     quantity: item.quantity,
                     total_price: new Prisma.Decimal(item.total_price),
                     special_instructions: item.special_instructions,
                     options: {
                        create: item.options.map((option: any) => ({
                           option: { connect: { option_id: option.option_id } },
                           option_name: option.option_name,
                           variants: {
                              create: option.variants.map((variant: any) => ({
                                 variant: {
                                    connect: { variant_id: variant.variant_id },
                                 },
                                 variant_name: variant.variant_name,
                                 variant_price: new Prisma.Decimal(
                                    variant.variant_price
                                 ),
                              })),
                           },
                        })),
                     },
                  })),
               },
            };

            const order = await tx.order.create({
               data: orderData,
               include: {
                  orderItems: {
                     include: {
                        options: {
                           include: {
                              variants: true,
                           },
                        },
                     },
                  },
                  payments: true,
               },
            });

            return this.mapOrderToDomain(order);
         });
      } catch (error) {
         console.error('Error creating order:', error);
         if (
            error instanceof NotFoundError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('Failed to create order');
      }
   }

   static async getAll(filters: OrderFilterDTO = {}): Promise<{
      orders: OrderSummary[];
      total: number;
      page: number;
      totalPages: number;
   }> {
      try {
         const {
            businessId,
            status,
            type,
            paymentStatus,
            tableId,
            customerId,
            dateFrom,
            dateTo,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc',
         } = filters;

         const skip = Math.max(0, (page - 1) * limit);
         const whereClause: Prisma.OrderWhereInput = {};

         if (businessId) whereClause.business_id = businessId;
         if (status) whereClause.status = status;
         if (type) whereClause.type = type;
         if (paymentStatus) whereClause.payment_status = paymentStatus;
         if (tableId) whereClause.table_id = tableId;
         if (customerId) whereClause.customer_id = customerId;

         if (dateFrom || dateTo) {
            whereClause.created_at = {};
            if (dateFrom) whereClause.created_at.gte = dateFrom;
            if (dateTo) whereClause.created_at.lte = dateTo;
         }

         if (search) {
            whereClause.OR = [
               { order_number: { contains: search, mode: 'insensitive' } },
               { customer_name: { contains: search, mode: 'insensitive' } },
               { customer_phone: { contains: search, mode: 'insensitive' } },
            ];
         }

         const orderBy: Prisma.OrderOrderByWithRelationInput = {};
         if (sortBy === 'created_at') {
            orderBy.created_at = sortOrder;
         } else if (sortBy === 'order_number') {
            orderBy.order_number = sortOrder;
         } else if (sortBy === 'grand_total') {
            orderBy.grand_total = sortOrder;
         }

         const [orders, total] = await Promise.all([
            prisma.order.findMany({
               where: whereClause,
               include: {
                  _count: {
                     select: { orderItems: true },
                  },
               },
               skip,
               take: limit,
               orderBy,
            }),
            prisma.order.count({ where: whereClause }),
         ]);

         return {
            orders: orders.map(this.mapOrderSummaryToDomain),
            total,
            page,
            totalPages: Math.ceil(total / limit),
         };
      } catch (error) {
         console.error('Error fetching orders:', error);
         throw new ValidationError('Failed to fetch orders');
      }
   }

   static async getOne(id: string): Promise<Order | null> {
      try {
         if (!id || typeof id !== 'string') {
            throw new ValidationError('Valid order ID is required');
         }

         const order = await prisma.order.findUnique({
            where: { order_id: id },
            include: {
               orderItems: {
                  include: {
                     options: {
                        include: {
                           variants: true,
                        },
                     },
                  },
               },
               payments: true,
            },
         });

         return order ? this.mapOrderToDomain(order) : null;
      } catch (error) {
         console.error('Error fetching order:', error);
         if (error instanceof ValidationError) {
            throw error;
         }
         throw new ValidationError('Failed to fetch order');
      }
   }

   static async getByOrderNumber(
      businessId: string,
      orderNumber: string
   ): Promise<Order | null> {
      try {
         if (!businessId || !orderNumber) {
            throw new ValidationError(
               'Business ID and order number are required'
            );
         }

         const order = await prisma.order.findFirst({
            where: {
               business_id: businessId,
               order_number: orderNumber,
            },
            include: {
               orderItems: {
                  include: {
                     options: {
                        include: {
                           variants: true,
                        },
                     },
                  },
               },
               payments: true,
            },
         });

         return order ? this.mapOrderToDomain(order) : null;
      } catch (error) {
         console.error('Error fetching order by number:', error);
         if (error instanceof ValidationError) {
            throw error;
         }
         throw new ValidationError('Failed to fetch order');
      }
   }

   static async update(id: string, data: UpdateOrderDTO): Promise<Order> {
      try {
         return await prisma.$transaction(async (tx) => {
            const existingOrder = await tx.order.findUnique({
               where: { order_id: id },
               include: { orderItems: true },
            });

            if (!existingOrder) {
               throw new NotFoundError('Order');
            }

            // Validate status transition
            if (
               data.status &&
               !this.isValidStatusTransition(
                  existingOrder.status as OrderStatus,
                  data.status
               )
            ) {
               throw new ValidationError(
                  `Invalid status transition from ${existingOrder.status} to ${data.status}`
               );
            }

            // Prepare update data
            const updateData: Prisma.OrderUpdateInput = {
               updated_at: new Date(),
            };

            if (data.tableId !== undefined) updateData.table_id = data.tableId;
            if (data.customerName !== undefined)
               updateData.customer_name = data.customerName;
            if (data.customerPhone !== undefined)
               updateData.customer_phone = data.customerPhone;
            if (data.status !== undefined) updateData.status = data.status;
            if (data.notes !== undefined) updateData.notes = data.notes;
            if (data.estimatedTime !== undefined)
               updateData.estimated_time = data.estimatedTime;

            // Recalculate totals if discount or tip changed
            if (data.discount !== undefined || data.tipAmount !== undefined) {
               const deliveryFee = Number(existingOrder.delivery_fee);
               const { subtotal, tax, grandTotal } =
                  await this.calculateOrderTotals(
                     existingOrder.business_id,
                     existingOrder.orderItems,
                     data.discount ?? Number(existingOrder.discount),
                     data.tipAmount ?? Number(existingOrder.tip_amount),
                     deliveryFee
                  );

               updateData.discount =
                  data.discount !== undefined
                     ? new Prisma.Decimal(data.discount)
                     : existingOrder.discount;
               updateData.tip_amount =
                  data.tipAmount !== undefined
                     ? new Prisma.Decimal(data.tipAmount)
                     : existingOrder.tip_amount;
               updateData.grand_total = new Prisma.Decimal(
                  grandTotal + deliveryFee
               );
            }

            const updated = await tx.order.update({
               where: { order_id: id },
               data: updateData,
               include: {
                  orderItems: {
                     include: {
                        options: {
                           include: {
                              variants: true,
                           },
                        },
                     },
                  },
                  payments: true,
               },
            });

            return this.mapOrderToDomain(updated);
         });
      } catch (error) {
         console.error('Error updating order:', error);
         if (
            error instanceof NotFoundError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('Failed to update order');
      }
   }

   static async cancel(id: string, reason?: string): Promise<Order> {
      try {
         return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
               where: { order_id: id },
            });

            if (!order) {
               throw new NotFoundError('Order');
            }

            if (
               order.status === OrderStatus.COMPLETED ||
               order.status === OrderStatus.CANCELLED
            ) {
               throw new ValidationError(
                  'Cannot cancel completed or already cancelled order'
               );
            }

            const notes = reason
               ? `${order.notes || ''}\nCancellation reason: ${reason}`.trim()
               : order.notes;

            const updated = await tx.order.update({
               where: { order_id: id },
               data: {
                  status: OrderStatus.CANCELLED,
                  notes,
                  updated_at: new Date(),
               },
               include: {
                  orderItems: {
                     include: {
                        options: {
                           include: {
                              variants: true,
                           },
                        },
                     },
                  },
                  payments: true,
               },
            });

            return this.mapOrderToDomain(updated);
         });
      } catch (error) {
         console.error('Error cancelling order:', error);
         if (
            error instanceof NotFoundError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('Failed to cancel order');
      }
   }

   static async addPayment(
      orderId: string,
      data: CreatePaymentDTO
   ): Promise<Payment> {
      try {
         return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
               where: { order_id: orderId },
               include: { payments: { where: { status: PaymentStatus.PAID } } },
            });

            if (!order) {
               throw new NotFoundError('Order');
            }

            if (order.status === OrderStatus.CANCELLED) {
               throw new ValidationError(
                  'Cannot add payment to cancelled order'
               );
            }

            // Calculate remaining amount
            const totalPaid = order.payments.reduce((sum, payment) => {
               return sum + Number(payment.amount);
            }, 0);

            const remainingAmount = Number(order.grand_total) - totalPaid;

            if (data.amount > remainingAmount + 0.01) {
               // Allow small rounding differences
               throw new ValidationError(
                  `Payment amount (${
                     data.amount
                  }) exceeds remaining balance (${remainingAmount.toFixed(2)})`
               );
            }

            const payment = await tx.payment.create({
               data: {
                  order: { connect: { order_id: orderId } },
                  amount: new Prisma.Decimal(data.amount),
                  payment_method: data.paymentMethod,
                  status: PaymentStatus.PAID,
                  transaction_id: data.transactionId || null,
                  reference: data.reference || null,
                  processed_at: new Date(),
               },
            });

            // Update order payment status
            const newTotalPaid = totalPaid + data.amount;
            let paymentStatus: PaymentStatus;

            if (newTotalPaid >= Number(order.grand_total) - 0.01) {
               // Allow small rounding differences
               paymentStatus = PaymentStatus.PAID;
            } else if (newTotalPaid > 0) {
               paymentStatus = PaymentStatus.PARTIAL;
            } else {
               paymentStatus = PaymentStatus.PENDING;
            }

            await tx.order.update({
               where: { order_id: orderId },
               data: {
                  payment_status: paymentStatus,
                  payment_method: data.paymentMethod,
                  updated_at: new Date(),
               },
            });

            return this.mapPaymentToDomain(payment);
         });
      } catch (error) {
         console.error('Error adding payment:', error);
         if (
            error instanceof NotFoundError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('Failed to add payment');
      }
   }

   static async getBusinessStats(
      businessId: string,
      dateFrom?: Date,
      dateTo?: Date
   ): Promise<OrderStats> {
      try {
         const whereClause: Prisma.OrderWhereInput = {
            business_id: businessId,
         };

         if (dateFrom || dateTo) {
            whereClause.created_at = {};
            if (dateFrom) whereClause.created_at.gte = dateFrom;
            if (dateTo) whereClause.created_at.lte = dateTo;
         }

         const [
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            revenueData,
            topSellingItems,
         ] = await Promise.all([
            prisma.order.count({ where: whereClause }),
            prisma.order.count({
               where: { ...whereClause, status: OrderStatus.PENDING },
            }),
            prisma.order.count({
               where: { ...whereClause, status: OrderStatus.COMPLETED },
            }),
            prisma.order.count({
               where: { ...whereClause, status: OrderStatus.CANCELLED },
            }),
            prisma.order.aggregate({
               where: {
                  ...whereClause,
                  status: { not: OrderStatus.CANCELLED },
               },
               _sum: { grand_total: true },
            }),
            prisma.orderItem.groupBy({
               by: ['item_id', 'item_name'],
               where: {
                  order: {
                     business_id: businessId,
                     status: { not: OrderStatus.CANCELLED },
                     ...(dateFrom || dateTo
                        ? { created_at: whereClause.created_at }
                        : {}),
                  },
               },
               _sum: {
                  quantity: true,
                  total_price: true,
               },
               orderBy: {
                  _sum: {
                     quantity: 'desc',
                  },
               },
               take: 10,
            }),
         ]);

         const totalRevenue = Number(revenueData._sum.grand_total || 0);
         const averageOrderValue =
            totalOrders > 0 ? totalRevenue / totalOrders : 0;

         return {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            averageOrderValue: Math.round(averageOrderValue * 100) / 100,
            topSellingItems: topSellingItems.map((item) => ({
               itemId: item.item_id || '',
               itemName: item.item_name || '',
               quantity: item._sum.quantity || 0,
               revenue: Number(item._sum.total_price || 0),
            })),
         };
      } catch (error) {
         console.error('Error fetching business stats:', error);
         throw new ValidationError('Failed to fetch business statistics');
      }
   }

   static async getDashboardStats(businessId: string): Promise<DashboardStats> {
      try {
         const now = new Date();
         const todayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
         );
         const weekStart = new Date(todayStart);
         weekStart.setDate(weekStart.getDate() - weekStart.getDay());
         const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

         const [todayStats, weekStats, monthStats, recentOrders] =
            await Promise.all([
               this.getBusinessStats(businessId, todayStart, now),
               this.getBusinessStats(businessId, weekStart, now),
               this.getBusinessStats(businessId, monthStart, now),
               this.getAll({
                  businessId,
                  limit: 10,
                  sortBy: 'created_at',
                  sortOrder: 'desc',
               }),
            ]);

         return {
            today: todayStats,
            thisWeek: weekStats,
            thisMonth: monthStats,
            recentOrders: recentOrders.orders,
         };
      } catch (error) {
         console.error('Error fetching dashboard stats:', error);
         throw new ValidationError('Failed to fetch dashboard statistics');
      }
   }

   private static isValidStatusTransition(
      currentStatus: OrderStatus,
      newStatus: OrderStatus
   ): boolean {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
         [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
         [OrderStatus.CONFIRMED]: [
            OrderStatus.PREPARING,
            OrderStatus.CANCELLED,
         ],
         [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
         [OrderStatus.READY]: [
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
         ],
         [OrderStatus.OUT_FOR_DELIVERY]: [
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED,
         ],
         [OrderStatus.COMPLETED]: [], // No transitions allowed from completed
         [OrderStatus.CANCELLED]: [], // No transitions allowed from cancelled
      };

      return validTransitions[currentStatus]?.includes(newStatus) || false;
   }
}

export default OrderService;
