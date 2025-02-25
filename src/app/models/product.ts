export interface ProductListResponseDto {
  pageIndex: number;
  pageSize: number;
  count: number;
  totalPage: number;
  data: ProductDto[];
}

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  images: ProductImageDto;
  variants: VariantDto[];
  category: string;
  isAvailable: boolean;
  cheapestPrice: number;
  discountRate: number;
  discountAmount: number;
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

export interface VariantDto {
  id: number;
  name: string;
  availableStock: number;
  image: string;
  price: number;
  discountRate: number;
  discountAmount: number;
}
