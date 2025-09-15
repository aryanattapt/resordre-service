import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

class UserService {
    static async getAll() {
        return prisma.user.findMany({ select: { user_id: true, user_name: true, fullname: true, email: true, role: true, is_active: true, created_at: true } });
    }

    static async getOne(id: string) {
        return prisma.user.findUnique({ where: { user_id: id }, select: { user_id: true, user_name: true, fullname: true, email: true, role: true, is_active: true, created_at: true } });
    }

    static async update(id: string, data: any) {
        if (data.password) {
            data.password_hash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        return prisma.user.update({ where: { user_id: id }, data });
    }

    static async remove(id: string) {
        return prisma.user.delete({ where: { user_id: id } });
    }
}

export default UserService;