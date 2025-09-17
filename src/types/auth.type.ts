// types/auth.type.ts
export enum UserRole {
   SUPER_ADMIN = 'super_admin',
   ADMIN = 'admin',
   OWNER = 'owner',
   MANAGER = 'manager',
   STAFF = 'staff',
   CASHIER = 'cashier',
}

export enum BusinessRole {
   OWNER = 'owner',
   MANAGER = 'manager',
   STAFF = 'staff',
   CASHIER = 'cashier',
   ADMIN = 'admin',
}

export interface User {
   userId: string;
   userName: string;
   fullname: string;
   email: string;
   role: UserRole;
   isActive: boolean;
   isVerified: boolean;
   lastLogin?: Date;
   failedLoginAttempts: number;
   lockedUntil?: Date;
   createdAt: Date;
   updatedAt: Date;
}

export interface UserWithBusinesses extends User {
   businesses: Array<{
      businessId: string;
      businessName: string;
      role: BusinessRole;
      isActive: boolean;
   }>;
}

export interface RefreshToken {
   tokenId: string;
   userId: string;
   token: string;
   expiresAt: Date;
   isRevoked: boolean;
   createdAt: Date;
}

export interface AuthTokens {
   accessToken: string;
   refreshToken: string;
   expiresIn: number;
   tokenType: string;
}

export interface AuthResponse {
   user: UserWithBusinesses;
   tokens: AuthTokens;
}

export interface JWTPayload {
   userId: string;
   userName: string;
   email: string;
   role: UserRole;
   businesses?: Array<{
      businessId: string;
      role: BusinessRole;
   }>;
   iat: number;
   exp: number;
}

// Request DTOs
export interface LoginDTO {
   identifier: string; // email or username
   password: string;
   rememberMe?: boolean;
}

export interface RegisterDTO {
   userName: string;
   fullname: string;
   email: string;
   password: string;
   role?: UserRole;
}

export interface ChangePasswordDTO {
   currentPassword: string;
   newPassword: string;
}

export interface ResetPasswordDTO {
   token: string;
   newPassword: string;
}

export interface ForgotPasswordDTO {
   email: string;
}

export interface RefreshTokenDTO {
   refreshToken: string;
}

export interface UpdateProfileDTO {
   fullname?: string;
   email?: string;
   userName?: string;
}

export interface CreateUserDTO extends RegisterDTO {
   businessId?: string;
   businessRole?: BusinessRole;
}

export interface UpdateUserDTO {
   fullname?: string;
   email?: string;
   userName?: string;
   role?: UserRole;
   isActive?: boolean;
   isVerified?: boolean;
}

export interface UserFilterDTO {
   role?: UserRole;
   isActive?: boolean;
   isVerified?: boolean;
   businessId?: string;
   search?: string;
   page?: number;
   limit?: number;
   sortBy?: 'created_at' | 'fullname' | 'email' | 'last_login';
   sortOrder?: 'asc' | 'desc';
}
