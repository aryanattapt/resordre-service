import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class MenuItemOptionService {
    static async create(data: any) {
        return prisma.menuItemOption.create({ data });
    }

    static async remove(id: string) {
        return prisma.menuItemOption.delete({ where: { option_id: id } });
    }
}

export default MenuItemOptionService;