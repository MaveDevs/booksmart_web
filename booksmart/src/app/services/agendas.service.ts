import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AgendasService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de agendas
   */
  getAgendas(): Observable<any[]> {
    return this.get(this.apiConfig.agendas.list);
  }

  /**
   * Obtener una agenda por ID
   */
  getAgendaById(id: number): Observable<any> {
    return this.getById(this.apiConfig.agendas.getById(id));
  }

  /**
   * Crear una nueva agenda
   */
  createAgenda(data: any): Observable<any> {
    return this.post(this.apiConfig.agendas.create, data);
  }

  /**
   * Actualizar una agenda
   */
  updateAgenda(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.agendas.update(id), data);
  }

  /**
   * Eliminar una agenda
   */
  deleteAgenda(id: number): Observable<any> {
    return this.delete(this.apiConfig.agendas.delete(id));
  }
}
