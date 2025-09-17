export interface OptionVariant {
   variantId: string;
   variantName: string;
   price: number;
   isAvailable: boolean;
}

export interface MenuItemOption {
   optionId: string;
   name: string;
   isRequired: boolean;
   maxSelections?: number;
   variants: OptionVariant[];
}

export interface MenuItem {
   itemId: string;
   itemName: string;
   description: string;
   price: number;
   imageUrl: string;
   isAvailable: boolean;
   categoryId: string;
   businessId: string;
   options: MenuItemOption[];
}

export interface MenuCategory {
   categoryId: string;
   categoryName: string;
   businessId: string;
   isActive: boolean;
   items?: MenuItem[];
}

// Request DTOs
export interface CreateOptionVariantDTO {
   variantName: string;
   price: number;
   isAvailable?: boolean;
   optionId?: string;
}

export interface UpdateOptionVariantDTO
   extends Partial<Omit<CreateOptionVariantDTO, 'optionId'>> {}

export interface CreateMenuItemOptionDTO {
   name: string;
   isRequired?: boolean;
   maxSelections?: number;
   variants?: CreateOptionVariantDTO[];
   itemId?: string;
}

export interface UpdateMenuItemOptionDTO
   extends Partial<Omit<CreateMenuItemOptionDTO, 'itemId'>> {}

export interface CreateMenuItemDTO {
   itemName: string;
   description?: string;
   price: number;
   imageUrl?: string;
   isAvailable?: boolean;
   categoryId: string;
   businessId: string;
   options?: CreateMenuItemOptionDTO[];
}

export interface UpdateMenuItemDTO
   extends Partial<Omit<CreateMenuItemDTO, 'businessId'>> {}

export interface CreateMenuCategoryDTO {
   categoryName: string;
   businessId: string;
   isActive?: boolean;
}

export interface UpdateMenuCategoryDTO
   extends Partial<Omit<CreateMenuCategoryDTO, 'businessId'>> {}

// Response DTOs (matching frontend types)
export interface CategoryItemOrder {
   categoryId: string;
   categoryName: string;
   menus: MenuItem[];
}

// types/menu.type.ts - Update the response types
export interface MenuItemForOrder {
   itemId: string;
   itemName: string;
   description: string;
   price: number;
   imageUrl: string;
   isAvailable: boolean;
   options?: MenuItemOptionForOrder[];
}

export interface MenuItemOptionForOrder {
   optionId: string;
   name: string;
   variants?: OptionVariantForOrder[];
}

export interface OptionVariantForOrder {
   variantId: string;
   variantName: string;
   price: number;
}

export interface CategoryItemOrderForOrder {
   categoryId: string;
   categoryName: string;
   menus: MenuItemForOrder[];
}

export interface MenuOrderResponse {
   restaurantId: string;
   name: string;
   items: CategoryItemOrderForOrder[];
}
