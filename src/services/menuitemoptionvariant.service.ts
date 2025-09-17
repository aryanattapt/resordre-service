import { PrismaClient } from '@prisma/client';
import {
   OptionVariant,
   CreateOptionVariantDTO,
   UpdateOptionVariantDTO,
} from '../types/menu.type';
import { NotFoundError, ValidationError } from '../utils/errors.util';

const prisma = new PrismaClient();

class MenuItemOptionVariantService {
   static mapDbToDomain(db: any): OptionVariant {
      return {
         variantId: db.variant_id,
         variantName: db.variant_name,
         price: Number(db.price),
         isAvailable: db.is_available,
      };
   }

   static async create(data: CreateOptionVariantDTO): Promise<OptionVariant> {
      return await prisma.$transaction(async (tx) => {
         // Ensure parent option exists
         const option = await tx.menuItemOption.findUnique({
            where: { option_id: data.optionId || '' },
         });

         if (!option) {
            throw new NotFoundError('Menu item option');
         }

         // Check for duplicate variant name in the same option
         const existingVariant = await tx.menuItemOptionVariant.findFirst({
            where: {
               option_id: data.optionId || '',
               variant_name: data.variantName,
            },
         });

         if (existingVariant) {
            throw new ValidationError(
               'Variant with this name already exists for this option'
            );
         }

         const created = await tx.menuItemOptionVariant.create({
            data: {
               option_id: data.optionId!,
               variant_name: data.variantName,
               price: data.price,
               is_available: data.isAvailable ?? true,
            },
         });

         return MenuItemOptionVariantService.mapDbToDomain(created);
      });
   }

   static async update(
      id: string,
      data: UpdateOptionVariantDTO
   ): Promise<OptionVariant> {
      return await prisma.$transaction(async (tx) => {
         const existingVariant = await tx.menuItemOptionVariant.findUnique({
            where: { variant_id: id },
         });

         if (!existingVariant) {
            throw new NotFoundError('Option variant');
         }

         // Check for duplicate name if updating variant name
         if (data.variantName) {
            const duplicateVariant = await tx.menuItemOptionVariant.findFirst({
               where: {
                  option_id: existingVariant.option_id,
                  variant_name: data.variantName,
                  variant_id: { not: id },
               },
            });

            if (duplicateVariant) {
               throw new ValidationError(
                  'Variant with this name already exists for this option'
               );
            }
         }

         const updated = await tx.menuItemOptionVariant.update({
            where: { variant_id: id },
            data: {
               ...(data.variantName !== undefined && {
                  variant_name: data.variantName,
               }),
               ...(data.price !== undefined && { price: data.price }),
               ...(data.isAvailable !== undefined && {
                  is_available: data.isAvailable,
               }),
               updated_at: new Date(),
            },
         });

         return MenuItemOptionVariantService.mapDbToDomain(updated);
      });
   }

   static async remove(id: string): Promise<void> {
      const variant = await prisma.menuItemOptionVariant.findUnique({
         where: { variant_id: id },
      });

      if (!variant) {
         throw new NotFoundError('Option variant');
      }

      await prisma.menuItemOptionVariant.delete({
         where: { variant_id: id },
      });
   }

   static async getOne(id: string): Promise<OptionVariant | null> {
      const variant = await prisma.menuItemOptionVariant.findUnique({
         where: { variant_id: id },
      });

      return variant
         ? MenuItemOptionVariantService.mapDbToDomain(variant)
         : null;
   }

   static async getByOptionId(optionId: string): Promise<OptionVariant[]> {
      const variants = await prisma.menuItemOptionVariant.findMany({
         where: { option_id: optionId },
         orderBy: { variant_name: 'asc' },
      });

      return variants.map(MenuItemOptionVariantService.mapDbToDomain);
   }
}

export default MenuItemOptionVariantService;
