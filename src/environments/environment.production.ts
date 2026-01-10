export const environment = {
  production: true,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  appInsightsConnectionString:
    'InstrumentationKey=1cd74c94-ea61-443c-9377-1bbcdb631b21;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/;ApplicationId=7ef6b9c5-c79e-4912-a29b-7ca3a3d7ddb6',
  serviceUrls: {
    'catalog-api': 'https://lontray.art/catalog-api',
    'basket-api': 'https://lontray.art/basket-api',
    'pricing-api': 'https://lontray.art/pricing-api',
    'ordering-api': 'https://lontray.art/ordering-api',
    bff: 'https://lontray.art/bff-web',
  },
};
