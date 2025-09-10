export interface MenuItemOption {
  optionId: string;
  name: string;
  price: number;
}

export interface MenuItem {
  itemId: string;
  itemName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  options: MenuItemOption[];
}
