export const environment = {
  production: true,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  siteUrl: 'https://printmeart.nl',
  analytics: {
    enabled: true,
    tenant: 'printmeart.nl',
    ga4MeasurementId: 'G-1LMLTH4RW1',
    posthogKey: 'phc_oUeFBEcuPKuQ3j2JSygtXJiCW4LUvXytJjVJDCwLS2vC',
    posthogHost: '/ph',
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
