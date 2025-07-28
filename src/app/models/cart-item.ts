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
  optionId: number; // TODO : Remove
  optionName?: string | undefined; // TODO : Remove
  id: number;
  spec1?: string;
  spec2?: string;
  spec3?: string;
  spec4?: string;
  spec5?: string;
  name?: string;
}
