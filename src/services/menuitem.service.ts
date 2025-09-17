import { PrismaClient } from '@prisma/client';
import {
   CreateMenuItemDTO,
   UpdateMenuItemDTO,
   MenuItem,
} from '../types/menu.type';
import { NotFoundError, ValidationError } from '../utils/errors.util';

const prisma = new PrismaClient();

export default class MenuItemService {
   private static mapDbToDomain(dbItem: any): MenuItem {
      return {
         itemId: dbItem.item_id,
         itemName: dbItem.item_name,
         description: dbItem.description || '',
         price: Number(dbItem.price),
         imageUrl: dbItem.image_url || '',
         isAvailable: dbItem.is_available,
         categoryId: dbItem.category_id,
         businessId: dbItem.business_id,
         options:
            dbItem.options?.map((opt: any) => ({
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
      };
   }

   static async create(data: CreateMenuItemDTO): Promise<MenuItem> {
      return await prisma.$transaction(async (tx) => {
         // Validate category exists and belongs to the same business
         const category = await tx.menuCategory.findUnique({
            where: { category_id: data.categoryId },
            include: { business: true },
         });

         if (!category) {
            throw new NotFoundError('Category');
         }

         if (category.business_id !== data.businessId) {
            throw new ValidationError(
               'Category does not belong to the specified business'
            );
         }

         // Check for duplicate item name in the same category
         const existingItem = await tx.menuItem.findFirst({
            where: {
               category_id: data.categoryId,
               item_name: data.itemName,
            },
         });

         if (existingItem) {
            throw new ValidationError(
               'Item with this name already exists in the category'
            );
         }

         const created = await tx.menuItem.create({
            data: {
               item_name: data.itemName || '',
               description: data.description || '',
               price: data.price || 0,
               image_url: data.imageUrl || '',
               is_available: data.isAvailable ?? true,
               category_id: data.categoryId,
               business_id: data.businessId,
               options: {
                  create:
                     data.options?.map((option) => ({
                        name: option.name || '',
                        is_required: option.isRequired ?? false,
                        max_selections: option.maxSelections || 1,
                        variants: {
                           create:
                              option.variants?.map((variant) => ({
                                 variant_name: variant.variantName,
                                 price: variant.price,
                                 is_available: variant.isAvailable ?? true,
                              })) || [],
                        },
                     })) || [],
               },
            },
            include: {
               options: {
                  include: {
                     variants: true,
                  },
               },
            },
         });

         return this.mapDbToDomain(created);
      });
   }

   static async getAll(
      businessId?: string,
      categoryId?: string
   ): Promise<MenuItem[]> {
      const whereClause: any = {};

      if (businessId) whereClause.business_id = businessId;
      if (categoryId) whereClause.category_id = categoryId;

      const items = await prisma.menuItem.findMany({
         where: whereClause,
         include: {
            options: {
               include: {
                  variants: true,
               },
            },
         },
         orderBy: { item_name: 'asc' },
      });

      return items.map(this.mapDbToDomain);
   }

   static async getOne(id: string): Promise<MenuItem | null> {
      const item = await prisma.menuItem.findUnique({
         where: { item_id: id },
         include: {
            options: {
               include: {
                  variants: true,
               },
            },
         },
      });

      return item ? this.mapDbToDomain(item) : null;
   }

   static async update(id: string, data: UpdateMenuItemDTO): Promise<MenuItem> {
      return await prisma.$transaction(async (tx) => {
         // Verify item exists
         const existingItem = await tx.menuItem.findUnique({
            where: { item_id: id },
         });

         if (!existingItem) {
            throw new NotFoundError('Menu item');
         }

         // Validate category if provided
         if (data.categoryId) {
            const category = await tx.menuCategory.findUnique({
               where: { category_id: data.categoryId },
            });

            if (!category) {
               throw new NotFoundError('Category');
            }

            if (category.business_id !== existingItem.business_id) {
               throw new ValidationError(
                  'Category does not belong to the same business'
               );
            }
         }

         // Check for duplicate name if updating item name
         if (data.itemName) {
            const duplicateItem = await tx.menuItem.findFirst({
               where: {
                  category_id: data.categoryId || existingItem.category_id,
                  item_name: data.itemName,
                  item_id: { not: id },
               },
            });

            if (duplicateItem) {
               throw new ValidationError(
                  'Item with this name already exists in the category'
               );
            }
         }

         const updated = await tx.menuItem.update({
            where: { item_id: id },
            data: {
               ...(data.itemName !== undefined && { item_name: data.itemName }),
               ...(data.description !== undefined && {
                  description: data.description,
               }),
               ...(data.price !== undefined && { price: data.price }),
               ...(data.imageUrl !== undefined && { image_url: data.imageUrl }),
               ...(data.isAvailable !== undefined && {
                  is_available: data.isAvailable,
               }),
               ...(data.categoryId !== undefined && {
                  category_id: data.categoryId,
               }),
               updated_at: new Date(),
            },
            include: {
               options: {
                  include: {
                     variants: true,
                  },
               },
            },
         });

         return this.mapDbToDomain(updated);
      });
   }

   static async remove(id: string): Promise<void> {
      const item = await prisma.menuItem.findUnique({
         where: { item_id: id },
      });

      if (!item) {
         throw new NotFoundError('Menu item');
      }

      await prisma.menuItem.delete({
         where: { item_id: id },
      });
   }
}
