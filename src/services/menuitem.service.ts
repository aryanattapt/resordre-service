import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class MenuItemService {
  static async getAll() {
    return prisma.menuItem.findMany({ include: { options: true } });
  }

  static async getOne(id: string) {
    return prisma.menuItem.findUnique({ where: { item_id: id }, include: { options: true } });
  }

  static async create(data: any) {
    const { options, ...rest } = data;
    return prisma.menuItem.create({ data: { ...rest, options: { create: options || [] } }, include: { options: true } });
  }

  static async update(id: string, data: any) {
    if (data.options) {
      await prisma.menuItemOption.deleteMany({ where: { item_id: id } });
      const optionsCreate = data.options;
      delete data.options;
      const updated = await prisma.menuItem.update({ where: { item_id: id }, data });
      if (optionsCreate && optionsCreate.length) {
        await prisma.menuItemOption.createMany({ data: optionsCreate.map((o: any) => ({ ...o, item_id: id })) });
      }
      return prisma.menuItem.findUnique({ where: { item_id: id }, include: { options: true } });
    }
    return prisma.menuItem.update({ where: { item_id: id }, data });
  }

  static async remove(id: string) {
    return prisma.menuItem.delete({ where: { item_id: id } });
  }
}

export default MenuItemService;