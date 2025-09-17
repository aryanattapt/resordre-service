import { body, param, query } from 'express-validator';
export const orderValidation = {
   create: [
      body('businessId').isUUID().withMessage('Valid business ID is required'),
      body('type')
         .isIn(['dine_in', 'takeaway', 'delivery'])
         .withMessage('Invalid order type'),
      body('tableId')
         .optional()
         .isString()
         .withMessage('Table ID must be string'),
      body('customerId')
         .optional()
         .isUUID()
         .withMessage('Invalid customer ID format'),
      body('customerName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Customer name must be 1-100 characters'),
      body('customerPhone')
         .optional()
         .isMobilePhone('any')
         .withMessage('Invalid phone number format'),
      body('notes')
         .optional()
         .trim()
         .isLength({ max: 500 })
         .withMessage('Notes must not exceed 500 characters'),
      body('estimatedTime')
         .optional()
         .isInt({ min: 1, max: 300 })
         .withMessage('Estimated time must be between 1-300 minutes'),
      body('orderItems')
         .isArray({ min: 1 })
         .withMessage('At least one order item is required'),
      body('orderItems.*.itemId')
         .isUUID()
         .withMessage('Valid item ID is required'),
      body('orderItems.*.quantity')
         .isInt({ min: 1, max: 50 })
         .withMessage('Quantity must be between 1-50'),
      body('orderItems.*.specialInstructions')
         .optional()
         .trim()
         .isLength({ max: 200 })
         .withMessage('Special instructions must not exceed 200 characters'),
      body('orderItems.*.options')
         .optional()
         .isArray()
         .withMessage('Options must be array'),
      body('orderItems.*.options.*.optionId')
         .optional()
         .isUUID()
         .withMessage('Valid option ID required'),
      body('orderItems.*.options.*.variants')
         .optional()
         .isArray()
         .withMessage('Variants must be array'),
      body('orderItems.*.options.*.variants.*.variantId')
         .optional()
         .isUUID()
         .withMessage('Valid variant ID required'),
      body('discount')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Discount must be non-negative'),
      body('tipAmount')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Tip amount must be non-negative'),
   ],

   update: [
      param('id').isUUID().withMessage('Valid order ID is required'),
      body('tableId')
         .optional()
         .isString()
         .withMessage('Table ID must be string'),
      body('customerName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Customer name must be 1-100 characters'),
      body('customerPhone')
         .optional()
         .isMobilePhone('any')
         .withMessage('Invalid phone number format'),
      body('status')
         .optional()
         .isIn([
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'out_for_delivery',
            'completed',
            'cancelled',
         ])
         .withMessage('Invalid status'),
      body('notes')
         .optional()
         .trim()
         .isLength({ max: 500 })
         .withMessage('Notes must not exceed 500 characters'),
      body('estimatedTime')
         .optional()
         .isInt({ min: 1, max: 300 })
         .withMessage('Estimated time must be between 1-300 minutes'),
      body('discount')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Discount must be non-negative'),
      body('tipAmount')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Tip amount must be non-negative'),
   ],

   getOne: [param('id').isUUID().withMessage('Valid order ID is required')],

   getByOrderNumber: [
      param('businessId').isUUID().withMessage('Valid business ID is required'),
      param('orderNumber')
         .matches(/^#\d{4}$/)
         .withMessage('Invalid order number format'),
   ],

   cancel: [
      param('id').isUUID().withMessage('Valid order ID is required'),
      body('reason')
         .optional()
         .trim()
         .isLength({ min: 1, max: 200 })
         .withMessage('Reason must be 1-200 characters'),
   ],

   addPayment: [
      param('id').isUUID().withMessage('Valid order ID is required'),
      body('amount')
         .isFloat({ min: 0.01 })
         .withMessage('Amount must be greater than 0'),
      body('paymentMethod')
         .isIn(['cash', 'card', 'digital_wallet', 'bank_transfer', 'credit'])
         .withMessage('Invalid payment method'),
      body('transactionId')
         .optional()
         .isString()
         .withMessage('Transaction ID must be string'),
      body('reference')
         .optional()
         .isString()
         .withMessage('Reference must be string'),
   ],

   getAll: [
      query('businessId')
         .optional()
         .isUUID()
         .withMessage('Invalid business ID format'),
      query('status')
         .optional()
         .isIn([
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'out_for_delivery',
            'completed',
            'cancelled',
         ])
         .withMessage('Invalid status'),
      query('type')
         .optional()
         .isIn(['dine_in', 'takeaway', 'delivery'])
         .withMessage('Invalid order type'),
      query('paymentStatus')
         .optional()
         .isIn(['pending', 'partial', 'paid', 'refunded'])
         .withMessage('Invalid payment status'),
      query('dateFrom')
         .optional()
         .isISO8601()
         .withMessage('Invalid date format'),
      query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
      query('page')
         .optional()
         .isInt({ min: 1 })
         .withMessage('Page must be positive integer'),
      query('limit')
         .optional()
         .isInt({ min: 1, max: 100 })
         .withMessage('Limit must be between 1-100'),
      query('sortBy')
         .optional()
         .isIn(['created_at', 'order_number', 'grand_total'])
         .withMessage('Invalid sort field'),
      query('sortOrder')
         .optional()
         .isIn(['asc', 'desc'])
         .withMessage('Invalid sort order'),
   ],

   getStats: [
      param('businessId').isUUID().withMessage('Valid business ID is required'),
      query('dateFrom')
         .optional()
         .isISO8601()
         .withMessage('Invalid date format'),
      query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
   ],
};
