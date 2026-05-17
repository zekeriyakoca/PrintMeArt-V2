export const environment = {
  production: false,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  analytics: {
    enabled: true,
    tenant: 'localhost',
    ga4MeasurementId: 'G-1LMLTH4RW1',
  },
  serviceUrls: {
    'catalog-api': 'http://localhost:5001',
    'pricing-api': 'http://localhost:5002',
    'basket-api': 'http://localhost:5003',
    'ordering-api': 'http://localhost:5004',
    bff: 'http://localhost:5010',
  },
  // serviceUrls: {
  //   'catalog-api': 'https://lontray.art/catalog-api',
  //   'basket-api': 'https://lontray.art/basket-api',
  //   'pricing-api': 'https://lontray.art/pricing-api',
  //   'ordering-api': 'https://lontray.art/ordering-api',
  //   bff: 'https://lontray.art/bff-web',
  // },
};
