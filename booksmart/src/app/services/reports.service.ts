import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de reportes
   */
  getReports(): Observable<any[]> {
    return this.get(this.apiConfig.reports.list);
  }

  /**
   * Obtener un reporte por ID
   */
  getReportById(id: number): Observable<any> {
    return this.getById(this.apiConfig.reports.getById(id));
  }

  /**
   * Crear un nuevo reporte
   */
  createReport(data: any): Observable<any> {
    return this.post(this.apiConfig.reports.create, data);
  }

  /**
   * Actualizar un reporte
   */
  updateReport(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.reports.update(id), data);
  }

  /**
   * Eliminar un reporte
   */
  deleteReport(id: number): Observable<any> {
    return this.delete(this.apiConfig.reports.delete(id));
  }
}
