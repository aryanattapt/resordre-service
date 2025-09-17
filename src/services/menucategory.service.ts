import { PrismaClient } from '@prisma/client';
import {
   MenuCategory,
   CreateMenuCategoryDTO,
   UpdateMenuCategoryDTO,
   MenuOrderResponse,
} from '../types/menu.type';
import { NotFoundError, ValidationError } from '../utils/errors.util';

const prisma = new PrismaClient();

class MenuCategoryService {
   static mapDbToDomain(db: any): MenuCategory {
      return {
         categoryId: db.category_id,
         categoryName: db.category_name,
         businessId: db.business_id,
         isActive: db.is_active,
         items:
            db.menuItems?.map((item: any) => ({
               itemId: item.item_id,
               itemName: item.item_name,
               description: item.description || '',
               price: Number(item.price),
               imageUrl: item.image_url || '',
               isAvailable: item.is_available,
               categoryId: item.category_id,
               businessId: item.business_id,
               options:
                  item.options?.map((opt: any) => ({
                     optionId: opt.option_id,
                     name: opt.name,
                     isRequired: opt.is_required,
                     maxSelections: opt.max_selections,
                     variants:
                        opt.variants?.map((variant: any) => ({
                           variantId: variant.variant_id,
                           variantName: variant.variant_name,
                           price: Number(variant.price),
                           isAvailable: variant.is_available,
                        })) || [],
                  })) || [],
            })) || [],
      };
   }

   static async getAll(businessId: string): Promise<MenuCategory[]> {
      // Verify business exists
      const business = await prisma.business.findUnique({
         where: { business_id: businessId },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      const categories = await prisma.menuCategory.findMany({
         where: {
            business_id: businessId,
            is_active: true,
         },
         include: {
            menuItems: {
               where: { is_available: true },
               include: {
                  options: {
                     include: {
                        variants: {
                           where: { is_available: true },
                        },
                     },
                  },
               },
               orderBy: { item_name: 'asc' },
            },
         },
         orderBy: { category_name: 'asc' },
      });

      return categories.map(MenuCategoryService.mapDbToDomain);
   }

   static async getOne(id: string): Promise<MenuCategory | null> {
      const category = await prisma.menuCategory.findUnique({
         where: { category_id: id },
         include: {
            menuItems: {
               include: {
                  options: {
                     include: {
                        variants: true,
                     },
                  },
               },
               orderBy: { item_name: 'asc' },
            },
         },
      });

      return category ? MenuCategoryService.mapDbToDomain(category) : null;
   }

   static async create(data: CreateMenuCategoryDTO): Promise<MenuCategory> {
      // Verify business exists
      const business = await prisma.business.findUnique({
         where: { business_id: data.businessId },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      // Check for duplicate category name in the same business
      const existingCategory = await prisma.menuCategory.findFirst({
         where: {
            business_id: data.businessId,
            category_name: data.categoryName,
            is_active: true,
         },
      });

      if (existingCategory) {
         throw new ValidationError(
            'Category with this name already exists in the business'
         );
      }

      const created = await prisma.menuCategory.create({
         data: {
            category_name: data.categoryName,
            business_id: data.businessId,
            is_active: data.isActive ?? true,
         },
         include: {
            menuItems: {
               include: {
                  options: {
                     include: {
                        variants: true,
                     },
                  },
               },
            },
         },
      });

      return MenuCategoryService.mapDbToDomain(created);
   }

   static async update(
      id: string,
      data: UpdateMenuCategoryDTO
   ): Promise<MenuCategory> {
      // Check if category exists
      const existingCategory = await prisma.menuCategory.findUnique({
         where: { category_id: id },
      });

      if (!existingCategory) {
         throw new NotFoundError('Category');
      }

      // Check for duplicate name if updating category name
      if (data.categoryName) {
         const duplicateCategory = await prisma.menuCategory.findFirst({
            where: {
               business_id: existingCategory.business_id,
               category_name: data.categoryName,
               category_id: { not: id },
               is_active: true,
            },
         });

         if (duplicateCategory) {
            throw new ValidationError(
               'Category with this name already exists in the business'
            );
         }
      }

      const updated = await prisma.menuCategory.update({
         where: { category_id: id },
         data: {
            ...(data.categoryName !== undefined && {
               category_name: data.categoryName,
            }),
            ...(data.isActive !== undefined && { is_active: data.isActive }),
            updated_at: new Date(),
         },
         include: {
            menuItems: {
               include: {
                  options: {
                     include: {
                        variants: true,
                     },
                  },
               },
            },
         },
      });

      return MenuCategoryService.mapDbToDomain(updated);
   }

   static async remove(id: string): Promise<void> {
      const category = await prisma.menuCategory.findUnique({
         where: { category_id: id },
      });

      if (!category) {
         throw new NotFoundError('Category');
      }

      await prisma.menuCategory.delete({
         where: { category_id: id },
      });
   }

   static async getMenuForOrder(
      businessId: string
   ): Promise<MenuOrderResponse> {
      const business = await prisma.business.findUnique({
         where: { business_id: businessId },
         include: {
            menuCategories: {
               where: { is_active: true },
               include: {
                  menuItems: {
                     where: { is_available: true },
                     include: {
                        options: {
                           include: {
                              variants: {
                                 where: { is_available: true },
                              },
                           },
                        },
                     },
                     orderBy: { item_name: 'asc' },
                  },
               },
               orderBy: { category_name: 'asc' },
            },
         },
      });

      if (!business) {
         throw new NotFoundError('Business');
      }

      return {
         restaurantId: business.business_id,
         name: business.business_name,
         items: business.menuCategories.map((category) => ({
            categoryId: category.category_id || '',
            categoryName: category.category_name || '',
            menus: category.menuItems.map((item) => ({
               itemId: item.item_id || '',
               itemName: item.item_name || '',
               description: item.description || '',
               price: Number(item.price) || 0,
               imageUrl: item.image_url || '',
               isAvailable: item.is_available || true,
               options: item.options.map((option) => ({
                  optionId: option.option_id || '',
                  name: option.name || '',
                  variants: option.variants.map((variant) => ({
                     variantId: variant.variant_id || '',
                     variantName: variant.variant_name || '',
                     price: Number(variant.price) || 0,
                  })),
               })),
            })),
         })),
      };
   }
}

export default MenuCategoryService;
