import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de citas
   */
  getAppointments(): Observable<any[]> {
    return this.get(this.apiConfig.appointments.list);
  }

  /**
   * Obtener una cita por ID
   */
  getAppointmentById(id: number): Observable<any> {
    return this.getById(this.apiConfig.appointments.getById(id));
  }

  /**
   * Obtener slots disponibles para un servicio y fecha.
   */
  getAvailableSlots(servicioId: number, targetDate: string, trabajadorId?: number | null): Observable<any> {
    const params = new URLSearchParams({
      servicio_id: String(servicioId),
      target_date: targetDate
    });

    if (trabajadorId !== undefined && trabajadorId !== null) {
      params.append('trabajador_id', String(trabajadorId));
    }

    return this.get(`${this.apiConfig.appointments.availabilitySlots}?${params.toString()}`);
  }

  /**
   * Crear una nueva cita
   */
  createAppointment(data: any): Observable<any> {
    return this.post(this.apiConfig.appointments.create, data);
  }

  /**
   * Obtener citas filtradas por trabajador.
   */
  getWorkerAppointments(trabajadorId: number, filters?: { status?: string; from_date?: string; to_date?: string }): Observable<any[]> {
    const params = new URLSearchParams({
      trabajador_id: String(trabajadorId)
    });

    if (filters?.status) params.append('status', filters.status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);

    return this.get(`${this.apiConfig.appointments.list}?${params.toString()}`);
  }

  /**
   * Obtener citas de negocio filtradas por establecimiento y, opcionalmente, trabajador.
   */
  getBusinessAppointments(establishmentId: number, trabajadorId?: number): Observable<any[]> {
    const params = new URLSearchParams({
      establishment_id: String(establishmentId)
    });

    if (trabajadorId !== undefined && trabajadorId !== null) {
      params.append('trabajador_id', String(trabajadorId));
    }

    return this.get(`${this.apiConfig.appointments.list}?${params.toString()}`);
  }

  /**
   * Actualizar una cita
   */
  updateAppointment(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.appointments.update(id), data);
  }

  /**
   * Eliminar una cita
   */
  deleteAppointment(id: number): Observable<any> {
    return this.delete(this.apiConfig.appointments.delete(id));
  }
}
