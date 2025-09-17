// types/business.type.ts
export enum BusinessType {
   RESTAURANT = 'restaurant',
   CAFE = 'cafe',
   FAST_FOOD = 'fast_food',
   FOOD_TRUCK = 'food_truck',
   BAKERY = 'bakery',
   BAR = 'bar',
   CATERING = 'catering',
}

export enum BusinessRole {
   OWNER = 'owner',
   MANAGER = 'manager',
   STAFF = 'staff',
   ADMIN = 'admin',
}

export interface Business {
   businessId: string;
   businessName: string;
   businessAddress?: string;
   businessPhoneNum?: string;
   businessEmail?: string;
   businessType: BusinessType;
   registerDate: Date;
   softOpeningDate?: Date;
   closeDate?: Date;
   isActive: boolean;
   ownerId?: string;
   taxRate: number;
   currency: string;
   timezone: string;
   businessLogo?: string;
   businessWebsite?: string;
   createdAt: Date;
   updatedAt: Date;
}

// Update the BusinessUser interface to handle the optional user property correctly
export interface BusinessUser {
   id: string;
   businessId: string;
   userId: string;
   role: BusinessRole;
   isActive: boolean;
}

export interface BusinessUserWithDetails extends BusinessUser {
   user: {
      userId: string;
      userName: string;
      fullname: string;
      email: string;
   };
}

export interface BusinessWithUsers extends Business {
   users: BusinessUserWithDetails[];
}

export interface BusinessStats {
   totalMenuItems: number;
   totalCategories: number;
   totalOrders: number;
   totalActiveUsers: number;
   revenue: {
      today: number;
      thisWeek: number;
      thisMonth: number;
   };
}

// Request DTOs
export interface CreateBusinessDTO {
   businessName: string;
   businessAddress?: string;
   businessPhoneNum?: string;
   businessEmail?: string;
   businessType?: BusinessType;
   registerDate?: Date;
   softOpeningDate?: Date;
   ownerId?: string;
   taxRate?: number;
   currency?: string;
   timezone?: string;
   businessLogo?: string;
   businessWebsite?: string;
}

export interface UpdateBusinessDTO
   extends Partial<Omit<CreateBusinessDTO, 'registerDate'>> {
   closeDate?: Date;
   isActive?: boolean;
}

export interface AddUserToBusinessDTO {
   userId: string;
   role: BusinessRole;
}

export interface UpdateUserRoleDTO {
   role: BusinessRole;
   isActive?: boolean;
}

export interface BusinessFilterDTO {
   isActive?: boolean;
   businessType?: BusinessType;
   ownerId?: string;
   search?: string;
   page?: number;
   limit?: number;
}
