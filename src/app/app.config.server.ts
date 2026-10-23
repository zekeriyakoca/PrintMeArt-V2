import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { INTERNAL_API_URL } from './interceptors/server-request';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: INTERNAL_API_URL, useFactory: () => process.env['INTERNAL_API_URL'] || null },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
