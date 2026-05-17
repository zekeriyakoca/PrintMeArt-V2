export const environment = {
  production: true,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  analytics: {
    enabled: true,
    tenant: 'printmeart.nl',
    ga4MeasurementId: 'G-1LMLTH4RW1',
    posthogKey: 'phc_uEijbYsS6ZLP5X5KkZXz6EU3exibBL6wm7Z4FtNLTziU',
    posthogHost: 'https://us.i.posthog.com',
  },
  serviceUrls: {
    'catalog-api': 'https://lontray.art/catalog-api',
    'basket-api': 'https://lontray.art/basket-api',
    'pricing-api': 'https://lontray.art/pricing-api',
    'ordering-api': 'https://lontray.art/ordering-api',
    'analytics-api': 'https://lontray.art/analytics-api',
    bff: 'https://lontray.art/bff-web',
  },
};
