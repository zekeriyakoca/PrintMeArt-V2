export const environment = {
  production: false,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  // Azure Application Insights (Browser SDK)
  // Leave empty to disable telemetry locally.
  appInsightsConnectionString: 'InstrumentationKey=***',
  // serviceUrls: {
  //   'catalog-api': 'http://localhost:5001',
  //   'pricing-api': 'http://localhost:5002',
  //   'basket-api': 'http://localhost:5003',
  //   'ordering-api': 'http://localhost:5004',
  //   bff: 'http://localhost:5010',
  // },
  // serviceUrls: {
  //   'catalog-api': 'http://4.210.248.46:30001',
  //   'basket-api': 'http://4.210.248.46:30003',
  //   'ordering-api': 'http://4.210.248.46:30004',
  //   'pricing-api': 'http://4.210.248.46:30002',
  //   'bff': 'http://4.210.248.46:5010',
  // },
  // serviceUrls: {
  //   'catalog-api':
  //     'https://ecommbone-apim.azure-api.net/storefront/catalog-api',
  //   'basket-api': 'https://ecommbone-apim.azure-api.net/storefront/basket-api',
  //   'pricing-api':
  //     'https://ecommbone-apim.azure-api.net/storefront/pricing-api',
  //   'ordering-api': 'http://4.210.248.46:30004',
  // },
  serviceUrls: {
    'catalog-api': 'https://nest.lontray.shop/catalog-api',
    'basket-api': 'https://nest.lontray.shop/basket-api',
    'pricing-api': 'https://nest.lontray.shop/pricing-api',
    'ordering-api': 'https://nest.lontray.shop/ordering-api',
    bff: 'https://nest.lontray.shop/bff',
  },
};
