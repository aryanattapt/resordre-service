import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const prisma = new PrismaClient();

class AuthService {
    static async register(data: any) {
        const { email, password, user_name, fullname, role = 'user' } = data;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error('Email already registered');

        const password_hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, password_hash, user_name, fullname, role } });
        const { password_hash: _, ...rest } = user as any;
        return rest;
    }

    static async login(data: any) {
        const { email, password } = data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) throw new Error('Invalid credentials');
        const token = jwt.sign({ user_id: user.user_id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return token;
    }
}

export default AuthService;