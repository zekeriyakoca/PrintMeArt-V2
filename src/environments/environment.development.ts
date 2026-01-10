export const environment = {
  production: false,
  apiUrl: 'BACKEND BASE URL COMES HERE',
  // Azure Application Insights (Browser SDK)
  appInsightsConnectionString:
    'InstrumentationKey=1cd74c94-ea61-443c-9377-1bbcdb631b21;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/;ApplicationId=7ef6b9c5-c79e-4912-a29b-7ca3a3d7ddb6',
  serviceUrls: {
    'catalog-api': 'http://localhost:5001',
    'pricing-api': 'http://localhost:5002',
    'basket-api': 'http://localhost:5003',
    'ordering-api': 'http://localhost:5004',
    bff: 'http://localhost:5010',
  },
  // serviceUrls: {
  //   'catalog-api': 'https://nest.lontray.shop/catalog-api',
  //   'basket-api': 'https://nest.lontray.shop/basket-api',
  //   'pricing-api': 'https://nest.lontray.shop/pricing-api',
  //   'ordering-api': 'https://nest.lontray.shop/ordering-api',
  //   bff: 'https://nest.lontray.shop/bff',
  // },
};
