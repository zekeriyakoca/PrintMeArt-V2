import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { INTERNAL_API_URL, PUBLIC_API_URL } from './interceptors/server-request';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: INTERNAL_API_URL, useFactory: () => process.env['INTERNAL_API_URL'] || null },
    // Responses fetched from the internal gateway are handed to the browser under the public address it asks for
    {
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => (process.env['INTERNAL_API_URL'] ? { [process.env['INTERNAL_API_URL']]: PUBLIC_API_URL } : {}),
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
