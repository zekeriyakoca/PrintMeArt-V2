/** '401-the-little-street': the id keeps the link working, the name makes it readable for people and search engines. */
export function productPath(product: { id: number; name?: string }): string {
  const slug = (product.name ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug ? `${product.id}-${slug}` : String(product.id);
}
