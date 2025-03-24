export interface PaginatedListDto<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPage: number;
  data: T[];
}

export interface ProductSimpleDto {
  id: number;
  name: string;
  description: string;
  image: ProductImageDto;
  isAvailable: boolean;
  cheapestPrice: number;
  discountRate: number;
  discountAmount: number;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  title: string;
  categoryName: string;
  images: ProductImageDto[];
  attributeIds: number[];
  hasCustomOptions: boolean;
  optionGroups: OptionGroupDto[];
  tags: number;
  cheapestPrice: number;
  discountRate: number;
  discountAmount: number;
  isAvailable: boolean;
}

export interface ProductImageDto {
  name: string;
  thumb: string;
  small: string;
  medium: string;
  large: string;
  original: string;
  order: number;
}

export interface OptionGroupDto {
  name: string;
  options: OptionDto[];
  selectedOptionId?: number;
}

export interface OptionDto {
  id: number;
  value: string;
  imageUrl: string;
  optionGroup: string;
  isCustom: boolean;
  pricePolicyName: string;
}

export interface FilterGroupDto {
  groupType: 'Attributes' | 'Categories' | 'Options';
  name: string;
  options: FilterOptionDto[];
}
export interface FilterOptionDto {
  id: number;
  name: string;
}
export interface ProductFilterRequestDto {
  pageSize: number;
  pageIndex: number;
  categoryId?: number;
  attributeId?: number;
  optionId?: number;
}
