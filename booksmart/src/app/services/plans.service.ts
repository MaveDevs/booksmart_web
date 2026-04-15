import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PlansService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de planes
   */
  getPlans(): Observable<any[]> {
    return this.get(this.apiConfig.plans.list);
  }

  /**
   * Obtener un plan por ID
   */
  getPlanById(id: number): Observable<any> {
    return this.getById(this.apiConfig.plans.getById(id));
  }

  /**
   * Crear un nuevo plan
   */
  createPlan(data: any): Observable<any> {
    return this.post(this.apiConfig.plans.create, data);
  }

  /**
   * Actualizar un plan
   */
  updatePlan(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.plans.update(id), data);
  }

  /**
   * Eliminar un plan
   */
  deletePlan(id: number): Observable<any> {
    return this.delete(this.apiConfig.plans.delete(id));
  }
}
