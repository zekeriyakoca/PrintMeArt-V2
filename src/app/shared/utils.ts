export function mapColorToHex(color: string): string {
  switch (color?.toLowerCase()) {
    case 'black':
      return '#1C1C1C'; // Charcoal Black
    case 'blue':
      return '#4682B4'; // Steel Blue
    case 'brown':
      return '#8B5A2B'; // Light Saddle Brown
    case 'gray':
      return '#A9A9A9'; // Dark Gray
    case 'green':
      return '#3CB371'; // Medium Sea Green
    case 'navy':
      return '#2C3E50'; // Midnight Navy
    case 'pink':
      return '#FFB6C1'; // Light Pink
    case 'red':
      return '#E74C3C'; // Soft Crimson Red
    case 'white':
      return '#F5F5F5'; // Linen White
    case 'yellow':
      return '#F4D03F'; // Mustard Yellow
    case 'rose':
      return '#D81B60'; // Rose Pink
    default:
      return '#34495E'; // Slate Blue
  }
}
