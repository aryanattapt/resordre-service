import { body, param, query } from 'express-validator';

export const menuCategoryValidation = {
   create: [
      body('businessId').isUUID().withMessage('Valid business ID is required'),
      body('categoryName')
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Category name must be 1-100 characters'),
      body('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
   ],

   update: [
      param('id').isUUID().withMessage('Valid category ID is required'),
      body('categoryName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Category name must be 1-100 characters'),
      body('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
   ],

   getOne: [param('id').isUUID().withMessage('Valid category ID is required')],

   getAll: [
      query('businessId').isUUID().withMessage('Valid business ID is required'),
   ],

   getMenuForOrder: [
      param('businessId').isUUID().withMessage('Valid business ID is required'),
   ],
};

export const menuItemValidation = {
   create: [
      body('businessId').isUUID().withMessage('Valid business ID is required'),
      body('categoryId').isUUID().withMessage('Valid category ID is required'),
      body('itemName')
         .trim()
         .isLength({ min: 1, max: 200 })
         .withMessage('Item name must be 1-200 characters'),
      body('description')
         .optional()
         .trim()
         .isLength({ max: 1000 })
         .withMessage('Description must not exceed 1000 characters'),
      body('price')
         .isFloat({ min: 0 })
         .withMessage('Price must be a positive number'),
      body('imageUrl')
         .optional()
         .isURL()
         .withMessage('Image URL must be valid'),
      body('isAvailable')
         .optional()
         .isBoolean()
         .withMessage('isAvailable must be boolean'),
      body('options')
         .optional()
         .isArray()
         .withMessage('Options must be an array'),
      body('options.*.name')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Option name must be 1-100 characters'),
      body('options.*.isRequired')
         .optional()
         .isBoolean()
         .withMessage('isRequired must be boolean'),
      body('options.*.maxSelections')
         .optional()
         .isInt({ min: 1 })
         .withMessage('maxSelections must be positive integer'),
      body('options.*.variants')
         .optional()
         .isArray()
         .withMessage('Variants must be an array'),
      body('options.*.variants.*.variantName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Variant name must be 1-100 characters'),
      body('options.*.variants.*.price')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Variant price must be positive'),
   ],

   update: [
      param('id').isUUID().withMessage('Valid item ID is required'),
      body('categoryId')
         .optional()
         .isUUID()
         .withMessage('Valid category ID is required'),
      body('itemName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 200 })
         .withMessage('Item name must be 1-200 characters'),
      body('description')
         .optional()
         .trim()
         .isLength({ max: 1000 })
         .withMessage('Description must not exceed 1000 characters'),
      body('price')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Price must be a positive number'),
      body('imageUrl')
         .optional()
         .isURL()
         .withMessage('Image URL must be valid'),
      body('isAvailable')
         .optional()
         .isBoolean()
         .withMessage('isAvailable must be boolean'),
   ],

   getOne: [param('id').isUUID().withMessage('Valid item ID is required')],

   getAll: [
      query('businessId')
         .optional()
         .isUUID()
         .withMessage('Valid business ID is required'),
      query('categoryId')
         .optional()
         .isUUID()
         .withMessage('Valid category ID is required'),
   ],
};

export const menuItemOptionValidation = {
   create: [
      param('id').isUUID().withMessage('Valid item ID is required'),
      body('name')
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Option name must be 1-100 characters'),
      body('isRequired')
         .optional()
         .isBoolean()
         .withMessage('isRequired must be boolean'),
      body('maxSelections')
         .optional()
         .isInt({ min: 1 })
         .withMessage('maxSelections must be positive integer'),
      body('variants')
         .optional()
         .isArray()
         .withMessage('Variants must be an array'),
      body('variants.*.variantName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Variant name must be 1-100 characters'),
      body('variants.*.price')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Variant price must be positive'),
   ],

   update: [
      param('id').isUUID().withMessage('Valid option ID is required'),
      body('name')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Option name must be 1-100 characters'),
      body('isRequired')
         .optional()
         .isBoolean()
         .withMessage('isRequired must be boolean'),
      body('maxSelections')
         .optional()
         .isInt({ min: 1 })
         .withMessage('maxSelections must be positive integer'),
   ],

   delete: [param('id').isUUID().withMessage('Valid option ID is required')],

   getOne: [param('id').isUUID().withMessage('Valid option ID is required')],
};

export const menuItemOptionVariantValidation = {
   create: [
      param('optionId').isUUID().withMessage('Valid option ID is required'),
      body('variantName')
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Variant name must be 1-100 characters'),
      body('price')
         .isFloat({ min: 0 })
         .withMessage('Price must be a positive number'),
      body('isAvailable')
         .optional()
         .isBoolean()
         .withMessage('isAvailable must be boolean'),
   ],

   update: [
      param('id').isUUID().withMessage('Valid variant ID is required'),
      body('variantName')
         .optional()
         .trim()
         .isLength({ min: 1, max: 100 })
         .withMessage('Variant name must be 1-100 characters'),
      body('price')
         .optional()
         .isFloat({ min: 0 })
         .withMessage('Price must be a positive number'),
      body('isAvailable')
         .optional()
         .isBoolean()
         .withMessage('isAvailable must be boolean'),
   ],

   delete: [param('id').isUUID().withMessage('Valid variant ID is required')],
};
