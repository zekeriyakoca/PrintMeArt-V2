export function mapColorToHex(color: string): string {
  switch (color?.toLowerCase()) {
    case 'red':
      return '#ff0000';
    case 'green':
      return '#00ff00';
    case 'blue':
      return '#0000ff';
    case 'white':
      return '#ffffff';
    default:
      return '#000000';
  }
}
