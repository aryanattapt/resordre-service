// services/business.service.ts
import { PrismaClient } from '@prisma/client';
import {
   Business,
   BusinessWithUsers,
   BusinessUser,
   BusinessUserWithDetails,
   BusinessStats,
   CreateBusinessDTO,
   UpdateBusinessDTO,
   AddUserToBusinessDTO,
   UpdateUserRoleDTO,
   BusinessFilterDTO,
   BusinessType,
   BusinessRole,
} from '../types/business.type';
import {
   NotFoundError,
   ValidationError,
   ConflictError,
} from '../utils/errors.util';

const prisma = new PrismaClient();

class BusinessService {
   static mapDbToDomain(db: any): Business {
      return {
         businessId: db.business_id,
         businessName: db.business_name,
         businessAddress: db.business_address,
         businessPhoneNum: db.business_phone_num,
         businessEmail: db.business_email,
         businessType: db.business_type as BusinessType,
         registerDate: db.register_date,
         softOpeningDate: db.soft_opening_date,
         closeDate: db.close_date,
         isActive: db.is_active,
         ownerId: db.owner_id,
         taxRate: Number(db.tax_rate),
         currency: db.currency,
         timezone: db.timezone,
         businessLogo: db.business_logo,
         businessWebsite: db.business_website,
         createdAt: db.created_at,
         updatedAt: db.updated_at,
      };
   }

   static mapBusinessUserToDomain(db: any): BusinessUser {
      return {
         id: db.id,
         businessId: db.business_id,
         userId: db.user_id,
         role: db.role as BusinessRole,
         isActive: db.is_active,
      };
   }

   static mapBusinessUserWithDetailsToDomain(db: any): BusinessUserWithDetails {
      return {
         id: db.id,
         businessId: db.business_id,
         userId: db.user_id,
         role: db.role as BusinessRole,
         isActive: db.is_active,
         user: {
            userId: db.user.user_id,
            userName: db.user.user_name,
            fullname: db.user.fullname,
            email: db.user.email,
         },
      };
   }

   static async create(data: CreateBusinessDTO): Promise<Business> {
      return await prisma.$transaction(async (tx) => {
         // Validate business email uniqueness if provided
         if (data.businessEmail) {
            const existingBusiness = await tx.business.findUnique({
               where: { business_email: data.businessEmail },
            });

            if (existingBusiness) {
               throw new ConflictError(
                  'Business with this email already exists'
               );
            }
         }

         // Validate owner exists if provided
         if (data.ownerId) {
            const owner = await tx.user.findUnique({
               where: { user_id: data.ownerId },
            });

            if (!owner) {
               throw new NotFoundError('Owner user');
            }
         }

         // Validate tax rate
         if (data.taxRate && (data.taxRate < 0 || data.taxRate > 1)) {
            throw new ValidationError(
               'Tax rate must be between 0 and 1 (0% to 100%)'
            );
         }

         const created = await tx.business.create({
            data: {
               business_name: data.businessName || 'Unnamed Business',
               business_address: data.businessAddress || '',
               business_phone_num: data.businessPhoneNum || '',
               business_email: data.businessEmail || '',
               business_type: data.businessType || BusinessType.RESTAURANT,
               register_date: data.registerDate || new Date(),
               soft_opening_date: data.softOpeningDate || null,
               owner_id: data.ownerId || null,
               tax_rate: data.taxRate || 0.0,
               currency: data.currency || 'USD',
               timezone: data.timezone || 'UTC',
               business_logo: data.businessLogo || '',
               business_website: data.businessWebsite || '',
               is_active: true,
            },
         });

         // If owner is specified, add them to business users
         if (data.ownerId) {
            await tx.businessUser.create({
               data: {
                  business_id: created.business_id,
                  user_id: data.ownerId,
                  role: BusinessRole.OWNER,
                  is_active: true,
               },
            });
         }

         return this.mapDbToDomain(created);
      });
   }

   static async getAll(filters: BusinessFilterDTO = {}): Promise<{
      businesses: Business[];
      total: number;
      page: number;
      totalPages: number;
   }> {
      const {
         isActive,
         businessType,
         ownerId,
         search,
         page = 1,
         limit = 10,
      } = filters;

      const skip = (page - 1) * limit;
      const whereClause: any = {};

      if (isActive !== undefined) whereClause.is_active = isActive;
      if (businessType) whereClause.business_type = businessType;
      if (ownerId) whereClause.owner_id = ownerId;

      if (search) {
         whereClause.OR = [
            { business_name: { contains: search, mode: 'insensitive' } },
            { business_address: { contains: search, mode: 'insensitive' } },
            { business_email: { contains: search, mode: 'insensitive' } },
         ];
      }

      const [businesses, total] = await Promise.all([
         prisma.business.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { created_at: 'desc' },
         }),
         prisma.business.count({ where: whereClause }),
      ]);

      return {
         businesses: businesses.map(this.mapDbToDomain),
         total,
         page,
         totalPages: Math.ceil(total / limit),
      };
   }

   static async getOne(id: string): Promise<Business | null> {
      const business = await prisma.business.findUnique({
         where: { business_id: id },
      });

      return business ? this.mapDbToDomain(business) : null;
   }

   static async getWithUsers(id: string): Promise<BusinessWithUsers | null> {
      const business = await prisma.business.findUnique({
         where: { business_id: id },
         include: {
            businessUsers: {
               where: { is_active: true },
               include: {
                  user: true,
               },
               orderBy: { created_at: 'asc' },
            },
         },
      });

      if (!business) return null;

      return {
         ...this.mapDbToDomain(business),
         users: business.businessUsers.map(
            this.mapBusinessUserWithDetailsToDomain
         ),
      };
   }

   static async update(id: string, data: UpdateBusinessDTO): Promise<Business> {
      return await prisma.$transaction(async (tx) => {
         const existingBusiness = await tx.business.findUnique({
            where: { business_id: id },
         });

         if (!existingBusiness) {
            throw new NotFoundError('Business');
         }

         // Validate email uniqueness if updating email
         if (
            data.businessEmail &&
            data.businessEmail !== existingBusiness.business_email
         ) {
            const emailExists = await tx.business.findUnique({
               where: { business_email: data.businessEmail },
            });

            if (emailExists) {
               throw new ConflictError(
                  'Business with this email already exists'
               );
            }
         }

         // Validate tax rate
         if (data.taxRate && (data.taxRate < 0 || data.taxRate > 1)) {
            throw new ValidationError(
               'Tax rate must be between 0 and 1 (0% to 100%)'
            );
         }

         const updateData: any = {
            updated_at: new Date(),
         };

         if (data.businessName !== undefined)
            updateData.business_name = data.businessName;
         if (data.businessAddress !== undefined)
            updateData.business_address = data.businessAddress;
         if (data.businessPhoneNum !== undefined)
            updateData.business_phone_num = data.businessPhoneNum;
         if (data.businessEmail !== undefined)
            updateData.business_email = data.businessEmail;
         if (data.businessType !== undefined)
            updateData.business_type = data.businessType;
         if (data.softOpeningDate !== undefined)
            updateData.soft_opening_date = data.softOpeningDate;
         if (data.closeDate !== undefined)
            updateData.close_date = data.closeDate;
         if (data.isActive !== undefined) updateData.is_active = data.isActive;
         if (data.ownerId !== undefined) updateData.owner_id = data.ownerId;
         if (data.taxRate !== undefined) updateData.tax_rate = data.taxRate;
         if (data.currency !== undefined) updateData.currency = data.currency;
         if (data.timezone !== undefined) updateData.timezone = data.timezone;
         if (data.businessLogo !== undefined)
            updateData.business_logo = data.businessLogo;
         if (data.businessWebsite !== undefined)
            updateData.business_website = data.businessWebsite;

         const updated = await tx.business.update({
            where: { business_id: id },
            data: updateData,
         });

         return this.mapDbToDomain(updated);
      });
   }

   static async remove(id: string): Promise<void> {
      const business = await prisma.business.findUnique({
         where: { business_id: id },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      await prisma.business.delete({
         where: { business_id: id },
      });
   }

   static async addUser(
      businessId: string,
      data: AddUserToBusinessDTO
   ): Promise<BusinessUserWithDetails> {
      return await prisma.$transaction(async (tx) => {
         // Validate business exists
         const business = await tx.business.findUnique({
            where: { business_id: businessId },
         });

         if (!business) {
            throw new NotFoundError('Business');
         }

         // Validate user exists
         const user = await tx.user.findUnique({
            where: { user_id: data.userId },
         });

         if (!user) {
            throw new NotFoundError('User');
         }

         // Check if user is already associated with this business
         const existingAssociation = await tx.businessUser.findUnique({
            where: {
               business_id_user_id: {
                  business_id: businessId,
                  user_id: data.userId,
               },
            },
         });

         if (existingAssociation) {
            throw new ConflictError(
               'User is already associated with this business'
            );
         }

         const created = await tx.businessUser.create({
            data: {
               business_id: businessId,
               user_id: data.userId,
               role: data.role,
               is_active: true,
            },
            include: {
               user: true,
            },
         });

         return this.mapBusinessUserWithDetailsToDomain(created);
      });
   }

   static async updateUserRole(
      businessId: string,
      userId: string,
      data: UpdateUserRoleDTO
   ): Promise<BusinessUserWithDetails> {
      return await prisma.$transaction(async (tx) => {
         const businessUser = await tx.businessUser.findUnique({
            where: {
               business_id_user_id: {
                  business_id: businessId,
                  user_id: userId,
               },
            },
         });

         if (!businessUser) {
            throw new NotFoundError('Business user association');
         }

         const updateData: any = {
            updated_at: new Date(),
         };

         if (data.role !== undefined) updateData.role = data.role;
         if (data.isActive !== undefined) updateData.is_active = data.isActive;

         const updated = await tx.businessUser.update({
            where: {
               business_id_user_id: {
                  business_id: businessId,
                  user_id: userId,
               },
            },
            data: updateData,
            include: {
               user: true,
            },
         });

         return this.mapBusinessUserWithDetailsToDomain(updated);
      });
   }

   static async removeUser(businessId: string, userId: string): Promise<void> {
      const businessUser = await prisma.businessUser.findUnique({
         where: {
            business_id_user_id: {
               business_id: businessId,
               user_id: userId,
            },
         },
      });

      if (!businessUser) {
         throw new NotFoundError('Business user association');
      }

      await prisma.businessUser.delete({
         where: {
            business_id_user_id: {
               business_id: businessId,
               user_id: userId,
            },
         },
      });
   }

   static async getBusinessUsers(
      businessId: string
   ): Promise<BusinessUserWithDetails[]> {
      const business = await prisma.business.findUnique({
         where: { business_id: businessId },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      const businessUsers = await prisma.businessUser.findMany({
         where: { business_id: businessId },
         include: {
            user: true,
         },
         orderBy: { created_at: 'asc' },
      });

      return businessUsers.map(this.mapBusinessUserWithDetailsToDomain);
   }

   static async getUserBusinesses(userId: string): Promise<Business[]> {
      const user = await prisma.user.findUnique({
         where: { user_id: userId },
      });

      if (!user) {
         throw new NotFoundError('User');
      }

      const businessUsers = await prisma.businessUser.findMany({
         where: {
            user_id: userId,
            is_active: true,
         },
         include: {
            business: true,
         },
      });

      return businessUsers.map((bu) => this.mapDbToDomain(bu.business));
   }

   static async getBusinessStats(businessId: string): Promise<BusinessStats> {
      const business = await prisma.business.findUnique({
         where: { business_id: businessId },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      const now = new Date();
      const todayStart = new Date(
         now.getFullYear(),
         now.getMonth(),
         now.getDate()
      );
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
         totalMenuItems,
         totalCategories,
         totalOrders,
         totalActiveUsers,
         todayOrders,
         weekOrders,
         monthOrders,
      ] = await Promise.all([
         prisma.menuItem.count({
            where: { business_id: businessId, is_available: true },
         }),
         prisma.menuCategory.count({
            where: { business_id: businessId, is_active: true },
         }),
         prisma.order.count({
            where: { business_id: businessId },
         }),
         prisma.businessUser.count({
            where: { business_id: businessId, is_active: true },
         }),
         prisma.order.aggregate({
            where: {
               business_id: businessId,
               created_at: { gte: todayStart },
               status: { not: 'cancelled' },
            },
            _sum: { grand_total: true },
         }),
         prisma.order.aggregate({
            where: {
               business_id: businessId,
               created_at: { gte: weekStart },
               status: { not: 'cancelled' },
            },
            _sum: { grand_total: true },
         }),
         prisma.order.aggregate({
            where: {
               business_id: businessId,
               created_at: { gte: monthStart },
               status: { not: 'cancelled' },
            },
            _sum: { grand_total: true },
         }),
      ]);

      return {
         totalMenuItems,
         totalCategories,
         totalOrders,
         totalActiveUsers,
         revenue: {
            today: Number(todayOrders._sum.grand_total || 0),
            thisWeek: Number(weekOrders._sum.grand_total || 0),
            thisMonth: Number(monthOrders._sum.grand_total || 0),
         },
      };
   }

   static async toggleActiveStatus(id: string): Promise<Business> {
      const business = await prisma.business.findUnique({
         where: { business_id: id },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      const updated = await prisma.business.update({
         where: { business_id: id },
         data: {
            is_active: !business.is_active,
            updated_at: new Date(),
         },
      });

      return this.mapDbToDomain(updated);
   }
}

export default BusinessService;
