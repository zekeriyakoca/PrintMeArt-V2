export interface CategoryImageDto {
  name: string;
  thumb: string;
  small: string;
  medium: string;
  large: string;
  original: string;
  order: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  slug: string;
  parentCategoryId: number | null;
  images: CategoryImageDto[];
  imageUrls: string[];
  imageUrl: string;
  childCategories: CategoryDto[];
}
