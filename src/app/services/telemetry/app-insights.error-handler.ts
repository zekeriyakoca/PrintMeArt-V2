import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { AppInsightsService } from './app-insights.service';

@Injectable()
export class AppInsightsErrorHandler extends ErrorHandler {
  private telemetry?: AppInsightsService;

  constructor(private readonly injector: Injector) {
    super();
  }

  override handleError(error: unknown): void {
    if (!this.telemetry) {
      this.telemetry = this.injector.get(AppInsightsService);
    }
    this.telemetry.trackException(error, { source: 'ErrorHandler' });
    super.handleError(error);
  }
}
