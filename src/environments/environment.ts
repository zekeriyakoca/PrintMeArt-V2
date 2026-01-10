export const environment = {
  production: false,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  // Azure Application Insights (Browser SDK)
  // Leave empty to disable telemetry locally.
  appInsightsConnectionString: 'InstrumentationKey=***',
  // serviceUrls: {
  //   'catalog-api':
  //     'https://ecommbone-apim.azure-api.net/storefront/catalog-api',
  //   'basket-api': 'https://ecommbone-apim.azure-api.net/storefront/basket-api',
  //   'pricing-api':
  //     'https://ecommbone-apim.azure-api.net/storefront/pricing-api',
  //   'ordering-api': 'http://4.210.248.46:30004',
  // },
  serviceUrls: {
    'catalog-api': 'https://lontray.art/catalog-api',
    'basket-api': 'https://lontray.art/basket-api',
    'pricing-api': 'https://lontray.art/pricing-api',
    'ordering-api': 'https://lontray.art/ordering-api',
    bff: 'https://lontray.art/bff-web',
  },
};
