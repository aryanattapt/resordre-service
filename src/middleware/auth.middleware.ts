import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendUnauthorized, sendForbidden } from '../utils/response.util';

interface JwtPayload {
    userId: string;
    role: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return sendUnauthorized(res, ['Missing or invalid token']);


    try {
        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        (req as any).user = decoded;
        next();
    } catch {
        return sendUnauthorized(res, ['Invalid or expired token']);
    }
}


export function authorize(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as JwtPayload;
        if (!user) return sendUnauthorized(res, ['User not authenticated']);
        if (!roles.includes(user.role)) return sendForbidden(res, ['Insufficient permissions']);
        next();
    };
}