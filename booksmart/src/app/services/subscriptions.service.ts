import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de suscripciones
   */
  getSubscriptions(): Observable<any[]> {
    return this.get(this.apiConfig.subscriptions.list);
  }

  /**
   * Obtener una suscripción por ID
   */
  getSubscriptionById(id: number): Observable<any> {
    return this.getById(this.apiConfig.subscriptions.getById(id));
  }

  /**
   * Crear una nueva suscripción
   */
  createSubscription(data: any): Observable<any> {
    return this.post(this.apiConfig.subscriptions.create, data);
  }

  /**
   * Actualizar una suscripción
   */
  updateSubscription(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.subscriptions.update(id), data);
  }

  /**
   * Eliminar una suscripción
   */
  deleteSubscription(id: number): Observable<any> {
    return this.delete(this.apiConfig.subscriptions.delete(id));
  }
}
