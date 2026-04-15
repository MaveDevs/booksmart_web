import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class WorkersService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener trabajadores de un establecimiento.
   */
  getWorkers(establishmentId?: number): Observable<any[]> {
    const url = establishmentId
      ? `${this.apiConfig.workers.list}?establishment_id=${establishmentId}`
      : this.apiConfig.workers.list;

    return this.get(url);
  }

  /**
   * Obtener un trabajador por ID.
   */
  getWorkerById(id: number): Observable<any> {
    return this.getById(this.apiConfig.workers.getById(id));
  }

  /**
   * Obtener el perfil de trabajador del usuario autenticado.
   */
  getMyWorkerProfile(): Observable<any> {
    return this.get(this.apiConfig.workers.me);
  }

  /**
   * Obtener servicios de un trabajador.
   */
  getWorkerServices(workerId: number): Observable<any[]> {
    return this.get(this.apiConfig.workers.services(workerId));
  }
}
