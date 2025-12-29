import { ErrorHandler, Injectable } from '@angular/core';
import { AppInsightsService } from './app-insights.service';

@Injectable()
export class AppInsightsErrorHandler extends ErrorHandler {
  constructor(private readonly telemetry: AppInsightsService) {
    super();
  }

  override handleError(error: unknown): void {
    this.telemetry.trackException(error, { source: 'ErrorHandler' });
    super.handleError(error);
  }
}
