import { RenderMode, ServerRoute } from '@angular/ssr';

// Pages that depend on the visitor are sent as the browser-only shell by server.ts
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
