import { PrismaClient } from '@prisma/client';
import {
   MenuItemOption,
   CreateMenuItemOptionDTO,
   UpdateMenuItemOptionDTO,
} from '../types/menu.type';
import { NotFoundError, ValidationError } from '../utils/errors.util';

const prisma = new PrismaClient();

class MenuItemOptionService {
   static mapDbToDomain(db: any): MenuItemOption {
      return {
         optionId: db.option_id,
         name: db.name,
         isRequired: db.is_required,
         maxSelections: db.max_selections,
         variants:
            db.variants?.map((variant: any) => ({
               variantId: variant.variant_id,
               variantName: variant.variant_name,
               price: Number(variant.price),
               isAvailable: variant.is_available,
            })) || [],
      };
   }

   static async create(data: CreateMenuItemOptionDTO): Promise<MenuItemOption> {
      return await prisma.$transaction(async (tx) => {
         // Ensure parent menu item exists
         const item = await tx.menuItem.findUnique({
            where: { item_id: data.itemId || '' },
         });

         if (!item) {
            throw new NotFoundError('Menu item');
         }

         // Check for duplicate option name in the same item
         const existingOption = await tx.menuItemOption.findFirst({
            where: {
               item_id: data.itemId || '',
               name: data.name,
            },
         });

         if (existingOption) {
            throw new ValidationError(
               'Option with this name already exists for this item'
            );
         }

         const created = await tx.menuItemOption.create({
            data: {
               item_id: data.itemId || '',
               name: data.name || '',
               is_required: data.isRequired ?? false,
               max_selections: data.maxSelections || 1,
               variants: {
                  create:
                     data.variants?.map((variant) => ({
                        variant_name: variant.variantName,
                        price: variant.price ?? 0,
                        is_available: variant.isAvailable ?? true,
                     })) || [],
               },
            },
            include: {
               variants: true,
            },
         });

         return MenuItemOptionService.mapDbToDomain(created);
      });
   }

   static async update(
      id: string,
      data: UpdateMenuItemOptionDTO
   ): Promise<MenuItemOption> {
      return await prisma.$transaction(async (tx) => {
         const existingOption = await tx.menuItemOption.findUnique({
            where: { option_id: id },
         });

         if (!existingOption) {
            throw new NotFoundError('Menu item option');
         }

         // Check for duplicate name if updating option name
         if (data.name) {
            const duplicateOption = await tx.menuItemOption.findFirst({
               where: {
                  item_id: existingOption.item_id,
                  name: data.name,
                  option_id: { not: id },
               },
            });

            if (duplicateOption) {
               throw new ValidationError(
                  'Option with this name already exists for this item'
               );
            }
         }

         const updated = await tx.menuItemOption.update({
            where: { option_id: id },
            data: {
               ...(data.name !== undefined && { name: data.name }),
               ...(data.isRequired !== undefined && {
                  is_required: data.isRequired,
               }),
               ...(data.maxSelections !== undefined && {
                  max_selections: data.maxSelections,
               }),
               updated_at: new Date(),
            },
            include: {
               variants: true,
            },
         });

         return MenuItemOptionService.mapDbToDomain(updated);
      });
   }

   static async remove(id: string): Promise<void> {
      const option = await prisma.menuItemOption.findUnique({
         where: { option_id: id },
      });

      if (!option) {
         throw new NotFoundError('Menu item option');
      }

      await prisma.menuItemOption.delete({
         where: { option_id: id },
      });
   }

   static async getOne(id: string): Promise<MenuItemOption | null> {
      const option = await prisma.menuItemOption.findUnique({
         where: { option_id: id },
         include: {
            variants: true,
         },
      });

      return option ? MenuItemOptionService.mapDbToDomain(option) : null;
   }

   static async getByItemId(itemId: string): Promise<MenuItemOption[]> {
      const options = await prisma.menuItemOption.findMany({
         where: { item_id: itemId },
         include: {
            variants: true,
         },
         orderBy: { name: 'asc' },
      });

      return options.map(MenuItemOptionService.mapDbToDomain);
   }
}

export default MenuItemOptionService;
