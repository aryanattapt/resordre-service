import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import {
   User,
   UserWithBusinesses,
   AuthResponse,
   AuthTokens,
   JWTPayload,
   LoginDTO,
   RegisterDTO,
   ChangePasswordDTO,
   ResetPasswordDTO,
   ForgotPasswordDTO,
   RefreshTokenDTO,
   UpdateProfileDTO,
   CreateUserDTO,
   UpdateUserDTO,
   UserFilterDTO,
   UserRole,
   BusinessRole,
} from '../types/auth.type';
import {
   NotFoundError,
   ValidationError,
   ConflictError,
} from '../utils/errors.util';

const prisma = new PrismaClient();

class AuthService {
   private static readonly JWT_SECRET =
      process.env.JWT_SECRET || 'your-super-secret-jwt-key';
   private static readonly JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
   private static readonly JWT_EXPIRES_IN = 1 * 60 * 60 * 1000; // 1 days
   private static readonly JWT_REFRESH_EXPIRES_IN = 7 * 60 * 60 * 1000; // 7 days
   private static readonly PASSWORD_RESET_EXPIRES_IN = 30 * 60 * 1000; // 30 minutes
   private static readonly MAX_LOGIN_ATTEMPTS = 5;
   private static readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutes

   static mapUserToDomain(db: any): User {
      if (!db) return {} as User;

      return {
         userId: db.user_id || '',
         userName: db.user_name || '',
         fullname: db.fullname || '',
         email: db.email || '',
         role: (db.role as UserRole) || UserRole.STAFF,
         isActive: db.is_active ?? true,
         isVerified: db.is_verified ?? false,
         lastLogin: db.last_login || undefined,
         failedLoginAttempts: db.failed_login_attempts || 0,
         lockedUntil: db.locked_until || undefined,
         createdAt: db.created_at || new Date(),
         updatedAt: db.updated_at || new Date(),
      };
   }

   static mapUserWithBusinessesToDomain(db: any): UserWithBusinesses {
      const user = this.mapUserToDomain(db);
      return {
         ...user,
         businesses: Array.isArray(db.businessUsers)
            ? db.businessUsers
                 .filter((bu: any) => bu.is_active)
                 .map((bu: any) => ({
                    businessId: bu.business_id,
                    businessName: bu.business?.business_name || '',
                    role: bu.role as BusinessRole,
                    isActive: bu.is_active,
                 }))
            : [],
      };
   }

   private static async hashPassword(password: string): Promise<string> {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
   }

   private static async comparePassword(
      password: string,
      hash: string
   ): Promise<boolean> {
      return await bcrypt.compare(password, hash);
   }

   private static generateAccessToken(
      payload: Omit<JWTPayload, 'iat' | 'exp'>
   ): string {
      const secret: Secret = this.JWT_SECRET as Secret; // cast to Secret
      const options: SignOptions = {
         expiresIn: this.JWT_EXPIRES_IN, // should be string | number
         issuer: 'pos-restaurant-api',
         audience: 'pos-restaurant-app',
      };

      return jwt.sign(payload, secret, options);
   }

   private static generateRefreshToken(): string {
      return crypto.randomBytes(64).toString('hex');
   }

   private static async storeRefreshToken(
      userId: string,
      token: string,
      rememberMe: boolean = false
   ): Promise<void> {
      const expiresAt = new Date();
      expiresAt.setTime(
         expiresAt.getTime() +
            (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000)
      ); // 30 days or 7 days

      await prisma.refreshToken.create({
         data: {
            user_id: userId,
            token,
            expires_at: expiresAt,
         },
      });
   }

   private static async cleanupExpiredTokens(): Promise<void> {
      await prisma.refreshToken.deleteMany({
         where: {
            OR: [{ expires_at: { lt: new Date() } }, { is_revoked: true }],
         },
      });
   }

   private static validatePassword(password: string): void {
      if (password.length < 8) {
         throw new ValidationError(
            'Password must be at least 8 characters long'
         );
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
         throw new ValidationError(
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
         );
      }
   }

   static async register(data: RegisterDTO): Promise<User> {
      try {
         return await prisma.$transaction(async (tx) => {
            // Validate password
            this.validatePassword(data.password);

            // Check if user already exists
            const existingUser = await tx.user.findFirst({
               where: {
                  OR: [{ email: data.email }, { user_name: data.userName }],
               },
            });

            if (existingUser) {
               if (existingUser.email === data.email) {
                  throw new ConflictError('Email already registered');
               }
               if (existingUser.user_name === data.userName) {
                  throw new ConflictError('Username already taken');
               }
            }

            // Hash password
            const passwordHash = await this.hashPassword(data.password);

            // Create user
            const user = await tx.user.create({
               data: {
                  user_name: data.userName,
                  fullname: data.fullname,
                  email: data.email,
                  password_hash: passwordHash,
                  role: data.role || UserRole.STAFF,
                  is_active: true,
                  is_verified: false,
               },
            });

            return this.mapUserToDomain(user);
         });
      } catch (error) {
         console.error('Registration error:', error);
         if (
            error instanceof ConflictError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('Failed to register user');
      }
   }

   static async login(data: LoginDTO): Promise<AuthResponse> {
      try {
         return await prisma.$transaction(async (tx) => {
            // Find user by email or username
            const user = await tx.user.findFirst({
               where: {
                  OR: [
                     { email: data.identifier },
                     { user_name: data.identifier },
                  ],
               },
               include: {
                  businessUsers: {
                     where: { is_active: true },
                     include: {
                        business: {
                           select: {
                              business_name: true,
                           },
                        },
                     },
                  },
               },
            });

            if (!user) {
               throw new ValidationError('Invalid credentials');
            }

            // Check if account is locked
            if (user.locked_until && user.locked_until > new Date()) {
               const lockTimeRemaining = Math.ceil(
                  (user.locked_until.getTime() - Date.now()) / 60000
               );
               throw new ValidationError(
                  `Account is locked. Try again in ${lockTimeRemaining} minutes`
               );
            }

            // Check if account is active
            if (!user.is_active) {
               throw new ValidationError('Account is deactivated');
            }

            // Verify password
            const isPasswordValid = await this.comparePassword(
               data.password,
               user.password_hash
            );

            if (!isPasswordValid) {
               // Increment failed login attempts
               const failedAttempts = user.failed_login_attempts + 1;
               const updateData: any = {
                  failed_login_attempts: failedAttempts,
                  updated_at: new Date(),
               };

               // Lock account if max attempts reached
               if (failedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                  updateData.locked_until = new Date(
                     Date.now() + this.LOCK_TIME
                  );
               }

               await tx.user.update({
                  where: { user_id: user.user_id },
                  data: updateData,
               });

               throw new ValidationError('Invalid credentials');
            }

            // Reset failed login attempts and update last login
            await tx.user.update({
               where: { user_id: user.user_id },
               data: {
                  failed_login_attempts: 0,
                  locked_until: null,
                  last_login: new Date(),
                  updated_at: new Date(),
               },
            });

            // Clean up expired tokens
            await this.cleanupExpiredTokens();

            // Prepare JWT payload
            const businesses = user.businessUsers.map((bu) => ({
               businessId: bu.business_id,
               role: bu.role as BusinessRole,
            }));

            const jwtPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
               userId: user.user_id,
               userName: user.user_name,
               email: user.email,
               role: user.role as UserRole,
               businesses,
            };

            // Generate tokens
            const accessToken = this.generateAccessToken(jwtPayload);
            const refreshToken = this.generateRefreshToken();

            // Store refresh token
            await this.storeRefreshToken(
               user.user_id,
               refreshToken,
               data.rememberMe
            );

            const tokens: AuthTokens = {
               accessToken,
               refreshToken,
               expiresIn: 15 * 60, // 15 minutes in seconds
               tokenType: 'Bearer',
            };

            return {
               user: this.mapUserWithBusinessesToDomain(user),
               tokens,
            };
         });
      } catch (error) {
         console.error('Login error:', error);
         if (error instanceof ValidationError) {
            throw error;
         }
         throw new ValidationError('Login failed');
      }
   }

   static async refreshToken(data: RefreshTokenDTO): Promise<AuthTokens> {
      try {
         return await prisma.$transaction(async (tx) => {
            // Find and validate refresh token
            const storedToken = await tx.refreshToken.findUnique({
               where: { token: data.refreshToken },
               include: {
                  user: {
                     include: {
                        businessUsers: {
                           where: { is_active: true },
                        },
                     },
                  },
               },
            });

            if (
               !storedToken ||
               storedToken.is_revoked ||
               storedToken.expires_at < new Date()
            ) {
               throw new ValidationError('Invalid or expired refresh token');
            }

            if (!storedToken.user.is_active) {
               throw new ValidationError('User account is deactivated');
            }

            // Prepare JWT payload
            const businesses = storedToken.user.businessUsers.map((bu) => ({
               businessId: bu.business_id,
               role: bu.role as BusinessRole,
            }));

            const jwtPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
               userId: storedToken.user.user_id,
               userName: storedToken.user.user_name,
               email: storedToken.user.email,
               role: storedToken.user.role as UserRole,
               businesses,
            };

            // Generate new tokens
            const accessToken = this.generateAccessToken(jwtPayload);
            const newRefreshToken = this.generateRefreshToken();

            // Revoke old refresh token
            await tx.refreshToken.update({
               where: { token_id: storedToken.token_id },
               data: { is_revoked: true },
            });

            // Store new refresh token
            await this.storeRefreshToken(storedToken.user_id, newRefreshToken);

            return {
               accessToken,
               refreshToken: newRefreshToken,
               expiresIn: 15 * 60, // 15 minutes in seconds
               tokenType: 'Bearer',
            };
         });
      } catch (error) {
         console.error('Refresh token error:', error);
         if (error instanceof ValidationError) {
            throw error;
         }
         throw new ValidationError('Token refresh failed');
      }
   }

   static async logout(userId: string, refreshToken?: string): Promise<void> {
      try {
         if (refreshToken) {
            // Revoke specific refresh token
            await prisma.refreshToken.updateMany({
               where: {
                  user_id: userId,
                  token: refreshToken,
               },
               data: { is_revoked: true },
            });
         } else {
            // Revoke all refresh tokens for user
            await prisma.refreshToken.updateMany({
               where: { user_id: userId },
               data: { is_revoked: true },
            });
         }
      } catch (error) {
         console.error('Logout error:', error);
         throw new ValidationError('Logout failed');
      }
   }

   static async changePassword(
      userId: string,
      data: ChangePasswordDTO
   ): Promise<void> {
      try {
         return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
               where: { user_id: userId },
            });

            if (!user) {
               throw new NotFoundError('User');
            }

            // Verify current password
            const isCurrentPasswordValid = await this.comparePassword(
               data.currentPassword,
               user.password_hash
            );
            if (!isCurrentPasswordValid) {
               throw new ValidationError('Current password is incorrect');
            }

            // Validate new password
            this.validatePassword(data.newPassword);

            // Check if new password is different from current
            const isSamePassword = await this.comparePassword(
               data.newPassword,
               user.password_hash
            );
            if (isSamePassword) {
               throw new ValidationError(
                  'New password must be different from current password'
               );
            }

            // Hash new password
            const newPasswordHash = await this.hashPassword(data.newPassword);

            // Update password
            await tx.user.update({
               where: { user_id: userId },
               data: {
                  password_hash: newPasswordHash,
                  updated_at: new Date(),
               },
            });

            // Revoke all refresh tokens to force re-login
            await tx.refreshToken.updateMany({
               where: { user_id: userId },
               data: { is_revoked: true },
            });
         });
      } catch (error) {
         console.error('Change password error:', error);
         if (
            error instanceof NotFoundError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('Password change failed');
      }
   }

   static async forgotPassword(data: ForgotPasswordDTO): Promise<string> {
      try {
         return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
               where: { email: data.email },
            });

            if (!user) {
               // Don't reveal if email exists or not
               return 'If the email exists, a password reset link has been sent';
            }

            if (!user.is_active) {
               throw new ValidationError('Account is deactivated');
            }

            // Invalidate existing password reset tokens
            await tx.passwordReset.updateMany({
               where: {
                  user_id: user.user_id,
                  is_used: false,
               },
               data: { is_used: true },
            });

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(
               Date.now() + this.PASSWORD_RESET_EXPIRES_IN
            );

            // Store reset token
            await tx.passwordReset.create({
               data: {
                  user_id: user.user_id,
                  token: resetToken,
                  expires_at: expiresAt,
               },
            });

            // TODO: Send email with reset token
            // await emailService.sendPasswordResetEmail(user.email, resetToken);

            return resetToken; // In production, don't return the token, just send email
         });
      } catch (error) {
         console.error('Forgot password error:', error);
         if (error instanceof ValidationError) {
            throw error;
         }
         throw new ValidationError('Password reset request failed');
      }
   }

   static async resetPassword(data: ResetPasswordDTO): Promise<void> {
      try {
         return await prisma.$transaction(async (tx) => {
            // Find valid reset token
            const passwordReset = await tx.passwordReset.findFirst({
               where: {
                  token: data.token,
                  is_used: false,
                  expires_at: { gt: new Date() },
               },
               include: { user: true },
            });

            if (!passwordReset) {
               throw new ValidationError('Invalid or expired reset token');
            }

            // Validate new password
            this.validatePassword(data.newPassword);

            // Hash new password
            const newPasswordHash = await this.hashPassword(data.newPassword);

            // Update password
            await tx.user.update({
               where: { user_id: passwordReset.user_id },
               data: {
                  password_hash: newPasswordHash,
                  failed_login_attempts: 0,
                  locked_until: null,
                  updated_at: new Date(),
               },
            });

            // Mark reset token as used
            await tx.passwordReset.update({
               where: { reset_id: passwordReset.reset_id },
               data: { is_used: true },
            });

            // Revoke all refresh tokens
            await tx.refreshToken.updateMany({
               where: { user_id: passwordReset.user_id },
               data: { is_revoked: true },
            });
         });
      } catch (error) {
         console.error('Reset password error:', error);
         if (error instanceof ValidationError) {
            throw error;
         }
         throw new ValidationError('Password reset failed');
      }
   }

   static async updateProfile(
      userId: string,
      data: UpdateProfileDTO
   ): Promise<User> {
      try {
         return await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
               where: { user_id: userId },
            });

            if (!existingUser) {
               throw new NotFoundError('User');
            }

            // Check for email/username conflicts
            if (data.email && data.email !== existingUser.email) {
               const emailExists = await tx.user.findUnique({
                  where: { email: data.email },
               });
               if (emailExists) {
                  throw new ConflictError('Email already in use');
               }
            }

            if (data.userName && data.userName !== existingUser.user_name) {
               const usernameExists = await tx.user.findUnique({
                  where: { user_name: data.userName },
               });
               if (usernameExists) {
                  throw new ConflictError('Username already taken');
               }
            }

            const updateData: Prisma.UserUpdateInput = {
               updated_at: new Date(),
            };

            if (data.fullname !== undefined)
               updateData.fullname = data.fullname;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.userName !== undefined)
               updateData.user_name = data.userName;

            const updated = await tx.user.update({
               where: { user_id: userId },
               data: updateData,
            });

            return this.mapUserToDomain(updated);
         });
      } catch (error) {
         console.error('Update profile error:', error);
         if (error instanceof NotFoundError || error instanceof ConflictError) {
            throw error;
         }
         throw new ValidationError('Profile update failed');
      }
   }

   static async verifyToken(token: string): Promise<JWTPayload> {
      try {
         const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;

         // Verify user still exists and is active
         const user = await prisma.user.findUnique({
            where: { user_id: decoded.userId },
         });

         if (!user || !user.is_active) {
            throw new ValidationError('Invalid token');
         }

         return decoded;
      } catch (error) {
         if (error instanceof jwt.JsonWebTokenError) {
            throw new ValidationError('Invalid token');
         }
         if (error instanceof jwt.TokenExpiredError) {
            throw new ValidationError('Token expired');
         }
         throw new ValidationError('Token verification failed');
      }
   }

   static async createUser(data: CreateUserDTO): Promise<User> {
      try {
         return await prisma.$transaction(async (tx) => {
            // Create user first
            const user = await this.register({
               userName: data.userName || '',
               fullname: data.fullname || '',
               email: data.email || '',
               password: data.password || '',
               role: data.role || UserRole.STAFF,
            });

            // If business info provided, add user to business
            if (data.businessId && data.businessRole) {
               const business = await tx.business.findUnique({
                  where: { business_id: data.businessId },
               });

               if (!business) {
                  throw new NotFoundError('Business');
               }

               await tx.businessUser.create({
                  data: {
                     business_id: data.businessId,
                     user_id: user.userId,
                     role: data.businessRole,
                     is_active: true,
                  },
               });
            }

            return user;
         });
      } catch (error) {
         console.error('Create user error:', error);
         if (
            error instanceof NotFoundError ||
            error instanceof ConflictError ||
            error instanceof ValidationError
         ) {
            throw error;
         }
         throw new ValidationError('User creation failed');
      }
   }

   static async getUsers(filters: UserFilterDTO = {}): Promise<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
   }> {
      try {
         const {
            role,
            isActive,
            isVerified,
            businessId,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc',
         } = filters;

         const skip = Math.max(0, (page - 1) * limit);
         const whereClause: Prisma.UserWhereInput = {};

         if (role) whereClause.role = role;
         if (isActive !== undefined) whereClause.is_active = isActive;
         if (isVerified !== undefined) whereClause.is_verified = isVerified;

         if (businessId) {
            whereClause.businessUsers = {
               some: {
                  business_id: businessId,
                  is_active: true,
               },
            };
         }

         if (search) {
            whereClause.OR = [
               { fullname: { contains: search, mode: 'insensitive' } },
               { email: { contains: search, mode: 'insensitive' } },
               { user_name: { contains: search, mode: 'insensitive' } },
            ];
         }

         const orderBy: Prisma.UserOrderByWithRelationInput = {};
         if (sortBy === 'created_at') orderBy.created_at = sortOrder;
         else if (sortBy === 'fullname') orderBy.fullname = sortOrder;
         else if (sortBy === 'email') orderBy.email = sortOrder;
         else if (sortBy === 'last_login') orderBy.last_login = sortOrder;

         const [users, total] = await Promise.all([
            prisma.user.findMany({
               where: whereClause,
               skip,
               take: limit,
               orderBy,
            }),
            prisma.user.count({ where: whereClause }),
         ]);

         return {
            users: users.map(this.mapUserToDomain),
            total,
            page,
            totalPages: Math.ceil(total / limit),
         };
      } catch (error) {
         console.error('Get users error:', error);
         throw new ValidationError('Failed to fetch users');
      }
   }

   static async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
      try {
         return await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
               where: { user_id: userId },
            });

            if (!existingUser) {
               throw new NotFoundError('User');
            }

            // Check for conflicts
            if (data.email && data.email !== existingUser.email) {
               const emailExists = await tx.user.findUnique({
                  where: { email: data.email },
               });
               if (emailExists) {
                  throw new ConflictError('Email already in use');
               }
            }

            if (data.userName && data.userName !== existingUser.user_name) {
               const usernameExists = await tx.user.findUnique({
                  where: { user_name: data.userName },
               });
               if (usernameExists) {
                  throw new ConflictError('Username already taken');
               }
            }

            const updateData: Prisma.UserUpdateInput = {
               updated_at: new Date(),
            };

            if (data.fullname !== undefined)
               updateData.fullname = data.fullname;
            if (data.email !== undefined) updateData.email = data.email;
            if (data.userName !== undefined)
               updateData.user_name = data.userName;
            if (data.role !== undefined) updateData.role = data.role;
            if (data.isActive !== undefined)
               updateData.is_active = data.isActive;
            if (data.isVerified !== undefined)
               updateData.is_verified = data.isVerified;

            const updated = await tx.user.update({
               where: { user_id: userId },
               data: updateData,
            });

            return this.mapUserToDomain(updated);
         });
      } catch (error) {
         console.error('Update user error:', error);
         if (error instanceof NotFoundError || error instanceof ConflictError) {
            throw error;
         }
         throw new ValidationError('User update failed');
      }
   }

   static async deleteUser(userId: string): Promise<void> {
      try {
         const user = await prisma.user.findUnique({
            where: { user_id: userId },
         });

         if (!user) {
            throw new NotFoundError('User');
         }

         await prisma.user.delete({
            where: { user_id: userId },
         });
      } catch (error) {
         console.error('Delete user error:', error);
         if (error instanceof NotFoundError) {
            throw error;
         }
         throw new ValidationError('User deletion failed');
      }
   }

   static async getUserProfile(userId: string): Promise<UserWithBusinesses> {
      try {
         const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
               businessUsers: {
                  where: { is_active: true },
                  include: {
                     business: {
                        select: {
                           business_name: true,
                        },
                     },
                  },
               },
            },
         });

         if (!user) {
            throw new NotFoundError('User');
         }

         return this.mapUserWithBusinessesToDomain(user);
      } catch (error) {
         console.error('Get user profile error:', error);
         if (error instanceof NotFoundError) {
            throw error;
         }
         throw new ValidationError('Failed to fetch user profile');
      }
   }
}

export default AuthService;
