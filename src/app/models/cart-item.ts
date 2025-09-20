export interface CustomerCart {
  customerId: string;
  items: CartItemDto[];
}

export interface CartItemDto {
  id: string;
  productId: number;
  variantId: number;
  selectedOptions: SelectedOptionDto[];
  unitPrice: number;
  quantity: number;
  noDiscountUnitPrice: number;
  productName: string;
  pictureUrl: string;
}

export interface SelectedOptionDto {
  optionId: number;
  optionName?: string | undefined;
  spec1?: string;
  spec2?: string;
  spec3?: string;
  spec4?: string;
  spec5?: string;
  name?: string;
}
