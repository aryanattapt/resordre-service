import { MenuItem } from "./menu.type";

export interface OrderItem extends MenuItem {
  note?: string;
}

export interface Order {
  businessId: string;
  tableId: string;
  menu: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
}
