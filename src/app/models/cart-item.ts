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
  optionValue: any;
  optionId: number;
  optionName?: string | undefined;
  spec1?: string;
  spec2?: string;
  spec3?: string;
  spec4?: string;
  spec5?: string;
  name?: string;
}

/**
 * Options that should not be displayed in the cart UI
 * (internal options used for backend tracking)
 */
const HIDDEN_OPTION_NAMES = ['CustomProductUrl'];

/**
 * Filters out internal options that shouldn't be displayed in the cart UI
 */
export function getDisplayableOptions(
  options: SelectedOptionDto[] | undefined,
): SelectedOptionDto[] {
  if (!options) return [];
  return options.filter(
    (opt) => !HIDDEN_OPTION_NAMES.includes(opt.optionName || opt.name || ''),
  );
}
