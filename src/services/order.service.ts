import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class OrderService {
    static async getAll() {
        return prisma.order.findMany({ include: { orderItems: { include: { options: true } } } });
    }

    static async getOne(id: string) {
        return prisma.order.findUnique({ where: { order_id: id }, include: { orderItems: { include: { options: true } } } });
    }

    static async create(data: any) {
        let subtotal = 0;

        const orderItemsData = data.orderItems.map((oi: any) => {
            const q = oi.quantity || 1;
            const itemPrice = parseFloat(oi.price);
            let itemTotal = itemPrice * q;
            if (Array.isArray(oi.options)) {
            oi.options.forEach((op: any) => {
                itemTotal = itemTotal + (parseFloat(op.price) || 0);
            });
            }
            subtotal = subtotal + itemTotal;

            return {
                item_id: oi.item_id,
                item_name: oi.item_name,
                price: oi.price,
                quantity: q,
                note: oi.note || undefined,
                options: {
                    create: (oi.options || []).map((op: any) => ({ option_id: op.option_id, name: op.name, price: op.price }))
                }
            };
        });

        const tax = parseFloat(data.tax || 0);
        const delivery_fee = parseFloat(data.delivery_fee || 0);
        const discount = parseFloat(data.discount || 0);
        const grand_total = subtotal + tax + delivery_fee - discount;

        const created = await prisma.order.create({
            data: {
            business_id: data.business_id,
            table_id: data.table_id,
            customer_id: data.customer_id,
            type: data.type,
            status: data.status || 'pending',
            subtotal: subtotal as any,
            tax: tax as any,
            delivery_fee: delivery_fee as any,
            discount: discount as any,
            grand_total: grand_total as any,
            orderItems: { create: orderItemsData }
            },
            include: { orderItems: { include: { options: true } } }
        });

        return created;
        }

        static async updateStatus(id: string, status: string) {
        return prisma.order.update({ where: { order_id: id }, data: { status } });
    }
}

export default OrderService;