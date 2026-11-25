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
  // The APIs are called on the shop's own domain (Traefik routes these paths to the backend), so the login cookie
  // is first-party. On lontray.art it was a third-party cookie, which incognito windows and Safari block.
  serviceUrls: {
    'catalog-api': 'https://printmeart.nl/catalog-api',
    'basket-api': 'https://printmeart.nl/basket-api',
    'pricing-api': 'https://printmeart.nl/pricing-api',
    'ordering-api': 'https://printmeart.nl/ordering-api',
    'analytics-api': 'https://printmeart.nl/analytics-api',
    // Cookie banner audit; a path without "analytics" in it, so ad blockers let it through
    'prefs-api': 'https://printmeart.nl/prefs-api',
    bff: 'https://printmeart.nl/bff-web',
  },
};
