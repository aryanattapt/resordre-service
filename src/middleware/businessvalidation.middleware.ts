import { body, param, query } from 'express-validator';

export const businessValidation = {
   create: [
      body('businessName')
         .trim()
         .isLength({ min: 1, max: 200 })
         .withMessage('Business name must be 1-200 characters'),
      body('businessAddress')
         .optional()
         .trim()
         .isLength({ max: 500 })
         .withMessage('Address must not exceed 500 characters'),
      body('businessPhoneNum')
         .optional()
         .isMobilePhone('any')
         .withMessage('Invalid phone number format'),
      body('businessEmail')
         .optional()
         .isEmail()
         .withMessage('Invalid email format'),
      body('businessType')
         .optional()
         .isIn([
            'restaurant',
            'cafe',
            'fast_food',
            'food_truck',
            'bakery',
            'bar',
            'catering',
         ])
         .withMessage('Invalid business type'),
      body('registerDate')
         .optional()
         .isISO8601()
         .withMessage('Invalid date format'),
      body('softOpeningDate')
         .optional()
         .isISO8601()
         .withMessage('Invalid date format'),
      body('ownerId')
         .optional()
         .isUUID()
         .withMessage('Invalid owner ID format'),
      body('taxRate')
         .optional()
         .isFloat({ min: 0, max: 1 })
         .withMessage('Tax rate must be between 0 and 1'),
      body('currency')
         .optional()
         .isLength({ min: 3, max: 3 })
         .withMessage('Currency must be 3 characters'),
      body('timezone')
         .optional()
         .isLength({ max: 50 })
         .withMessage('Timezone must not exceed 50 characters'),
      body('businessWebsite')
         .optional()
         .isURL()
         .withMessage('Invalid website URL'),
   ],

   update: [
      param('id').isUUID().withMessage('Valid business ID is required'),
      body('businessName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 200 })
         .withMessage('Business name must be 1-200 characters'),
      body('businessAddress')
         .optional()
         .trim()
         .isLength({ max: 500 })
         .withMessage('Address must not exceed 500 characters'),
      body('businessPhoneNum')
         .optional()
         .isMobilePhone('any')
         .withMessage('Invalid phone number format'),
      body('businessEmail')
         .optional()
         .isEmail()
         .withMessage('Invalid email format'),
      body('businessType')
         .optional()
         .isIn([
            'restaurant',
            'cafe',
            'fast_food',
            'food_truck',
            'bakery',
            'bar',
            'catering',
         ])
         .withMessage('Invalid business type'),
      body('softOpeningDate')
         .optional()
         .isISO8601()
         .withMessage('Invalid date format'),
      body('closeDate')
         .optional()
         .isISO8601()
         .withMessage('Invalid date format'),
      body('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
      body('ownerId')
         .optional()
         .isUUID()
         .withMessage('Invalid owner ID format'),
      body('taxRate')
         .optional()
         .isFloat({ min: 0, max: 1 })
         .withMessage('Tax rate must be between 0 and 1'),
      body('currency')
         .optional()
         .isLength({ min: 3, max: 3 })
         .withMessage('Currency must be 3 characters'),
      body('timezone')
         .optional()
         .isLength({ max: 50 })
         .withMessage('Timezone must not exceed 50 characters'),
      body('businessWebsite')
         .optional()
         .isURL()
         .withMessage('Invalid website URL'),
   ],

   getOne: [param('id').isUUID().withMessage('Valid business ID is required')],

   getAll: [
      query('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
      query('businessType')
         .optional()
         .isIn([
            'restaurant',
            'cafe',
            'fast_food',
            'food_truck',
            'bakery',
            'bar',
            'catering',
         ])
         .withMessage('Invalid business type'),
      query('ownerId')
         .optional()
         .isUUID()
         .withMessage('Invalid owner ID format'),
      query('page')
         .optional()
         .isInt({ min: 1 })
         .withMessage('Page must be a positive integer'),
      query('limit')
         .optional()
         .isInt({ min: 1, max: 100 })
         .withMessage('Limit must be between 1 and 100'),
   ],

   addUser: [
      param('id').isUUID().withMessage('Valid business ID is required'),
      body('userId').isUUID().withMessage('Valid user ID is required'),
      body('role')
         .isIn(['owner', 'manager', 'staff', 'admin'])
         .withMessage('Invalid role'),
   ],

   updateUserRole: [
      param('id').isUUID().withMessage('Valid business ID is required'),
      param('userId').isUUID().withMessage('Valid user ID is required'),
      body('role')
         .optional()
         .isIn(['owner', 'manager', 'staff', 'admin'])
         .withMessage('Invalid role'),
      body('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
   ],

   removeUser: [
      param('id').isUUID().withMessage('Valid business ID is required'),
      param('userId').isUUID().withMessage('Valid user ID is required'),
   ],
};
