export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  childCategories?: CategoryDto[];
}
