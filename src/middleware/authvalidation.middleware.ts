import { body, param, query } from 'express-validator';
export const authValidation = {
   register: [
      body('userName')
         .trim()
         .isLength({ min: 3, max: 30 })
         .withMessage('Username must be 3-30 characters')
         .matches(/^[a-zA-Z0-9_]+$/)
         .withMessage(
            'Username can only contain letters, numbers, and underscores'
         ),
      body('fullname')
         .trim()
         .isLength({ min: 2, max: 100 })
         .withMessage('Full name must be 2-100 characters'),
      body('email')
         .isEmail()
         .normalizeEmail()
         .withMessage('Valid email is required'),
      body('password')
         .isLength({ min: 8 })
         .withMessage('Password must be at least 8 characters long')
         .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
         .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
         ),
      body('role')
         .optional()
         .isIn(['super_admin', 'admin', 'owner', 'manager', 'staff', 'cashier'])
         .withMessage('Invalid role'),
   ],

   login: [
      body('identifier')
         .trim()
         .isLength({ min: 1 })
         .withMessage('Email or username is required'),
      body('password').isLength({ min: 1 }).withMessage('Password is required'),
      body('rememberMe')
         .optional()
         .isBoolean()
         .withMessage('Remember me must be boolean'),
   ],

   changePassword: [
      body('currentPassword')
         .isLength({ min: 1 })
         .withMessage('Current password is required'),
      body('newPassword')
         .isLength({ min: 8 })
         .withMessage('New password must be at least 8 characters long')
         .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
         .withMessage(
            'New password must contain at least one uppercase letter, one lowercase letter, and one number'
         ),
   ],

   forgotPassword: [
      body('email')
         .isEmail()
         .normalizeEmail()
         .withMessage('Valid email is required'),
   ],

   resetPassword: [
      body('token').isLength({ min: 1 }).withMessage('Reset token is required'),
      body('newPassword')
         .isLength({ min: 8 })
         .withMessage('New password must be at least 8 characters long')
         .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
         .withMessage(
            'New password must contain at least one uppercase letter, one lowercase letter, and one number'
         ),
   ],

   refreshToken: [
      body('refreshToken')
         .isLength({ min: 1 })
         .withMessage('Refresh token is required'),
   ],

   updateProfile: [
      body('fullname')
         .optional()
         .trim()
         .isLength({ min: 2, max: 100 })
         .withMessage('Full name must be 2-100 characters'),
      body('email')
         .optional()
         .isEmail()
         .normalizeEmail()
         .withMessage('Valid email is required'),
      body('userName')
         .optional()
         .trim()
         .isLength({ min: 3, max: 30 })
         .withMessage('Username must be 3-30 characters')
         .matches(/^[a-zA-Z0-9_]+$/)
         .withMessage(
            'Username can only contain letters, numbers, and underscores'
         ),
   ],

   createUser: [
      body('userName')
         .trim()
         .isLength({ min: 3, max: 30 })
         .withMessage('Username must be 3-30 characters')
         .matches(/^[a-zA-Z0-9_]+$/)
         .withMessage(
            'Username can only contain letters, numbers, and underscores'
         ),
      body('fullname')
         .trim()
         .isLength({ min: 2, max: 100 })
         .withMessage('Full name must be 2-100 characters'),
      body('email')
         .isEmail()
         .normalizeEmail()
         .withMessage('Valid email is required'),
      body('password')
         .isLength({ min: 8 })
         .withMessage('Password must be at least 8 characters long')
         .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
         .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
         ),
      body('role')
         .optional()
         .isIn(['super_admin', 'admin', 'owner', 'manager', 'staff', 'cashier'])
         .withMessage('Invalid role'),
      body('businessId')
         .optional()
         .isUUID()
         .withMessage('Valid business ID is required'),
      body('businessRole')
         .optional()
         .isIn(['owner', 'manager', 'staff', 'cashier', 'admin'])
         .withMessage('Invalid business role'),
   ],

   updateUser: [
      param('id').isUUID().withMessage('Valid user ID is required'),
      body('fullname')
         .optional()
         .trim()
         .isLength({ min: 2, max: 100 })
         .withMessage('Full name must be 2-100 characters'),
      body('email')
         .optional()
         .isEmail()
         .normalizeEmail()
         .withMessage('Valid email is required'),
      body('userName')
         .optional()
         .trim()
         .isLength({ min: 3, max: 30 })
         .withMessage('Username must be 3-30 characters')
         .matches(/^[a-zA-Z0-9_]+$/)
         .withMessage(
            'Username can only contain letters, numbers, and underscores'
         ),
      body('role')
         .optional()
         .isIn(['super_admin', 'admin', 'owner', 'manager', 'staff', 'cashier'])
         .withMessage('Invalid role'),
      body('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
      body('isVerified')
         .optional()
         .isBoolean()
         .withMessage('isVerified must be boolean'),
   ],

   getUsers: [
      query('role')
         .optional()
         .isIn(['super_admin', 'admin', 'owner', 'manager', 'staff', 'cashier'])
         .withMessage('Invalid role'),
      query('isActive')
         .optional()
         .isBoolean()
         .withMessage('isActive must be boolean'),
      query('isVerified')
         .optional()
         .isBoolean()
         .withMessage('isVerified must be boolean'),
      query('businessId')
         .optional()
         .isUUID()
         .withMessage('Invalid business ID'),
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
         .isIn(['created_at', 'fullname', 'email', 'last_login'])
         .withMessage('Invalid sort field'),
      query('sortOrder')
         .optional()
         .isIn(['asc', 'desc'])
         .withMessage('Invalid sort order'),
   ],

   getUserById: [param('id').isUUID().withMessage('Valid user ID is required')],
};
