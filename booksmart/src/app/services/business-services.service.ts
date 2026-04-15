import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessServicesService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de servicios
   */
  getServices(): Observable<any[]> {
    return this.get(this.apiConfig.services.list);
  }

  /**
   * Obtener un servicio por ID
   */
  getServiceById(id: number): Observable<any> {
    return this.getById(this.apiConfig.services.getById(id));
  }

  /**
   * Crear un nuevo servicio
   */
  createService(data: any): Observable<any> {
    return this.post(this.apiConfig.services.create, data);
  }

  /**
   * Actualizar un servicio
   */
  updateService(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.services.update(id), data);
  }

  /**
   * Eliminar un servicio
   */
  deleteService(id: number): Observable<any> {
    return this.delete(this.apiConfig.services.delete(id));
  }
}
