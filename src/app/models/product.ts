import { Museum } from './../data/museums';
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
  secondImage: ProductImageDto;
  thirdImage: ProductImageDto;
  isAvailable: boolean;
  cheapestPrice: number;
  discountRate: number;
  discountAmount: number;
  imageRatio: number;
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  title: string;
  categoryName: string;
  images: ProductImageDto[];
  attributeIds: number[];
  attributes: string[];
  hasCustomOptions: boolean;
  optionGroups: OptionGroupDto[];
  tags: number;
  cheapestPrice: number;
  discountRate: number;
  discountAmount: number;
  isAvailable: boolean;
  metadata: ProductMetadata;
  sourceUrl?: string;
  creditLine?: string;
}

export class ProductMetadata {
  OriginalImageWidth: string = '0';
  OriginalImageHeight: string = '0';
  Museum: string = '';
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
  name: string;
}
export interface ProductFilterRequestDto {
  pageSize: number;
  pageIndex: number;
  searchTerm?: string;
  categoryName?: string;
  attributeName?: string;
  optionName?: string;
  tags?: ProductTags;
}

export enum ProductTags {
  None = 0, // 0
  OnSale = 1 << 0, // 1
  Featured = 1 << 1, // 2
  TopSellers = 1 << 2, // 4
  OurPick = 1 << 3, // 8
}
