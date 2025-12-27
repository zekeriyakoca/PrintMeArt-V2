export const environment = {
  production: false,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  // serviceUrls: {
  //   'catalog-api': 'http://localhost:5001',
  //   'pricing-api': 'http://localhost:5002',
  //   'basket-api': 'http://localhost:5003',
  //   'ordering-api': 'http://localhost:5004',
  //   bff: 'http://localhost:5010',
  // },
  serviceUrls: {
    'catalog-api': 'https://nest.lontray.shop/catalog-api',
    'basket-api': 'https://nest.lontray.shop/basket-api',
    'pricing-api': 'https://nest.lontray.shop/pricing-api',
    'ordering-api': 'https://nest.lontray.shop/ordering-api',
    bff: 'https://nest.lontray.shop/bff',
  },
};
