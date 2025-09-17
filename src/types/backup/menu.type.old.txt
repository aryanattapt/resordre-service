export interface MenuItemOption {
  optionId: string;
  name: string;
  price: number;
}

export interface MenuItem {
  itemId: string;
  itemName: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  options: MenuItemOption[];
}

export interface CategoryItemOrder {
  categoryId: string;
  categoryName: string;
  menus: MenuItem[];
}

export interface MenuOrderResponse {
  restaurantId: string;
  name: string;
  items: CategoryItemOrder[];
}
