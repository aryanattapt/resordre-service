// types/order.type.ts
export enum OrderType {
   DINE_IN = 'dine_in',
   TAKEAWAY = 'takeaway',
   DELIVERY = 'delivery',
}

export enum OrderStatus {
   PENDING = 'pending',
   CONFIRMED = 'confirmed',
   PREPARING = 'preparing',
   READY = 'ready',
   OUT_FOR_DELIVERY = 'out_for_delivery',
   COMPLETED = 'completed',
   CANCELLED = 'cancelled',
}

export enum PaymentStatus {
   PENDING = 'pending',
   PARTIAL = 'partial',
   PAID = 'paid',
   REFUNDED = 'refunded',
}

export enum PaymentMethod {
   CASH = 'cash',
   CARD = 'card',
   DIGITAL_WALLET = 'digital_wallet',
   BANK_TRANSFER = 'bank_transfer',
   CREDIT = 'credit',
}

export interface OrderItemOptionVariant {
   id: string;
   variantId: string;
   variantName: string;
   variantPrice: number;
}

export interface OrderItemOption {
   id: string;
   optionId: string;
   optionName: string;
   variants: OrderItemOptionVariant[];
}

export interface OrderItem {
   orderItemId: string;
   itemId: string;
   itemName: string;
   basePrice: number;
   quantity: number;
   totalPrice: number;
   specialInstructions?: string;
   options: OrderItemOption[];
}

export interface Payment {
   paymentId: string;
   orderId: string;
   amount: number;
   paymentMethod: PaymentMethod;
   status: PaymentStatus;
   transactionId?: string;
   reference?: string;
   processedAt?: Date;
   createdAt: Date;
}

export interface Order {
   orderId: string;
   businessId: string;
   tableId?: string;
   customerId?: string;
   customerName?: string;
   customerPhone?: string;
   orderNumber: string;
   type: OrderType;
   status: OrderStatus;
   subtotal: number;
   tax: number;
   deliveryFee: number;
   discount: number;
   tipAmount: number;
   grandTotal: number;
   paymentStatus: PaymentStatus;
   paymentMethod?: string;
   notes?: string;
   estimatedTime?: number;
   createdAt: Date;
   updatedAt: Date;
   orderItems: OrderItem[];
   payments: Payment[];
}

export interface OrderSummary {
   orderId: string;
   orderNumber: string;
   customerName?: string;
   type: OrderType;
   status: OrderStatus;
   grandTotal: number;
   paymentStatus: PaymentStatus;
   estimatedTime?: number;
   createdAt: Date;
   itemCount: number;
}

// Request DTOs
export interface CreateOrderItemOptionVariantDTO {
   variantId: string;
}

export interface CreateOrderItemOptionDTO {
   optionId: string;
   variants: CreateOrderItemOptionVariantDTO[];
}

export interface CreateOrderItemDTO {
   itemId: string;
   quantity: number;
   specialInstructions?: string;
   options: CreateOrderItemOptionDTO[];
}

export interface CreateOrderDTO {
   businessId: string;
   tableId?: string;
   customerId?: string;
   customerName?: string;
   customerPhone?: string;
   type: OrderType;
   notes?: string;
   estimatedTime?: number;
   orderItems: CreateOrderItemDTO[];
   discount?: number;
   tipAmount?: number;
}

export interface UpdateOrderDTO {
   tableId?: string;
   customerName?: string;
   customerPhone?: string;
   status?: OrderStatus;
   notes?: string;
   estimatedTime?: number;
   discount?: number;
   tipAmount?: number;
}

export interface CreatePaymentDTO {
   amount: number;
   paymentMethod: PaymentMethod;
   transactionId?: string;
   reference?: string;
}

export interface OrderFilterDTO {
   businessId?: string;
   status?: OrderStatus;
   type?: OrderType;
   paymentStatus?: PaymentStatus;
   tableId?: string;
   customerId?: string;
   dateFrom?: Date;
   dateTo?: Date;
   search?: string;
   page?: number;
   limit?: number;
   sortBy?: 'created_at' | 'order_number' | 'grand_total';
   sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
   totalOrders: number;
   pendingOrders: number;
   completedOrders: number;
   cancelledOrders: number;
   totalRevenue: number;
   averageOrderValue: number;
   topSellingItems: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      revenue: number;
   }>;
}

export interface DashboardStats {
   today: OrderStats;
   thisWeek: OrderStats;
   thisMonth: OrderStats;
   recentOrders: OrderSummary[];
}
