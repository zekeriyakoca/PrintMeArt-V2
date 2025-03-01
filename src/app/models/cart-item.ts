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
  optionName?: string;
}
