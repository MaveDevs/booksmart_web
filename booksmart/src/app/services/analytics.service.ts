import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener resumen del sistema
   */
  getSystemOverview(): Observable<any> {
    return this.get(this.apiConfig.analytics.systemOverview);
  }
}
