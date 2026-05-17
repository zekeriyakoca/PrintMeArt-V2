export const environment = {
  production: false,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  analytics: {
    enabled: true,
    tenant: 'printmeart.nl',
    ga4MeasurementId: 'G-1LMLTH4RW1',
    posthogKey: 'phc_uEijbYsS6ZLP5X5KkZXz6EU3exibBL6wm7Z4FtNLTziU',
    posthogHost: 'https://us.i.posthog.com',
    pageViewsWithoutConsent: true,
  },
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
