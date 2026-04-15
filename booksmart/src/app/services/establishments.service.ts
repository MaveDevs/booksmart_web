import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class EstablishmentsService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de establecimientos
   */
  getEstablishments(): Observable<any[]> {
    return this.get(this.apiConfig.establishments.list);
  }

  /**
   * Obtener un establecimiento por ID
   */
  getEstablishmentById(id: number): Observable<any> {
    return this.getById(this.apiConfig.establishments.getById(id));
  }

  /**
   * Crear un nuevo establecimiento
   */
  createEstablishment(data: any): Observable<any> {
    return this.post(this.apiConfig.establishments.create, data);
  }

  /**
   * Actualizar un establecimiento
   */
  updateEstablishment(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.establishments.update(id), data);
  }

  /**
   * Eliminar un establecimiento
   */
  deleteEstablishment(id: number): Observable<any> {
    return this.delete(this.apiConfig.establishments.delete(id));
  }
}
