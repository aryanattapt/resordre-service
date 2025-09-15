import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class MenuCategoryService {
    static async getAll() {
        return prisma.menuCategory.findMany();
    }

    static async getOne(id: string) {
        return prisma.menuCategory.findUnique({ where: { category_id: id } });
    }

    static async create(data: any) {
        return prisma.menuCategory.create({ data });
    }

    static async update(id: string, data: any) {
        return prisma.menuCategory.update({ where: { category_id: id }, data });
    }

    static async remove(id: string) {
        return prisma.menuCategory.delete({ where: { category_id: id } });
    }
}

export default MenuCategoryService;