import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  
  private readonly baseUrl = environment.apiUrl;

  /**
   * Rutas de autenticación
   */
  readonly auth = {
    login: `${this.baseUrl}/auth/login/access-token`,
    me: `${this.baseUrl}/users/me`
  };

  /**
   * Rutas de usuarios
   */
  readonly users = {
    list: `${this.baseUrl}/users/`,
    getById: (id: number) => `${this.baseUrl}/users/${id}`,
    create: `${this.baseUrl}/users/`,
    update: (id: number) => `${this.baseUrl}/users/${id}`,
    delete: (id: number) => `${this.baseUrl}/users/${id}`
  };

  /**
   * Rutas de servicios
   */
  readonly services = {
    list: `${this.baseUrl}/services/`,
    getById: (id: number) => `${this.baseUrl}/services/${id}`,
    create: `${this.baseUrl}/services/`,
    update: (id: number) => `${this.baseUrl}/services/${id}`,
    delete: (id: number) => `${this.baseUrl}/services/${id}`
  };

  /**
   * Rutas de citas/appointments
   */
  readonly appointments = {
    list: `${this.baseUrl}/appointments/`,
    getById: (id: number) => `${this.baseUrl}/appointments/${id}`,
    availabilitySlots: `${this.baseUrl}/appointments/availability/slots`,
    create: `${this.baseUrl}/appointments/`,
    update: (id: number) => `${this.baseUrl}/appointments/${id}`,
    delete: (id: number) => `${this.baseUrl}/appointments/${id}`
  };

  /**
   * Rutas de trabajadores
   */
  readonly workers = {
    list: `${this.baseUrl}/workers/`,
    getById: (id: number) => `${this.baseUrl}/workers/${id}`,
    me: `${this.baseUrl}/workers/me`,
    services: (id: number) => `${this.baseUrl}/workers/${id}/services`,
    create: `${this.baseUrl}/workers/`,
    update: (id: number) => `${this.baseUrl}/workers/${id}`,
    delete: (id: number) => `${this.baseUrl}/workers/${id}`
  };

  /**
   * Rutas de establecimientos
   */
  readonly establishments = {
    list: `${this.baseUrl}/establishments/`,
    getById: (id: number) => `${this.baseUrl}/establishments/${id}`,
    create: `${this.baseUrl}/establishments/`,
    update: (id: number) => `${this.baseUrl}/establishments/${id}`,
    delete: (id: number) => `${this.baseUrl}/establishments/${id}`
  };

  /**
   * Rutas de planes
   */
  readonly plans = {
    list: `${this.baseUrl}/plans/`,
    getById: (id: number) => `${this.baseUrl}/plans/${id}`,
    create: `${this.baseUrl}/plans/`,
    update: (id: number) => `${this.baseUrl}/plans/${id}`,
    delete: (id: number) => `${this.baseUrl}/plans/${id}`
  };

  /**
   * Rutas de suscripciones
   */
  readonly subscriptions = {
    list: `${this.baseUrl}/subscriptions/`,
    getById: (id: number) => `${this.baseUrl}/subscriptions/${id}`,
    create: `${this.baseUrl}/subscriptions/`,
    update: (id: number) => `${this.baseUrl}/subscriptions/${id}`,
    delete: (id: number) => `${this.baseUrl}/subscriptions/${id}`
  };

  /**
   * Rutas de reportes
   */
  readonly reports = {
    list: `${this.baseUrl}/reports/`,
    getById: (id: number) => `${this.baseUrl}/reports/${id}`,
    create: `${this.baseUrl}/reports/`,
    update: (id: number) => `${this.baseUrl}/reports/${id}`,
    delete: (id: number) => `${this.baseUrl}/reports/${id}`
  };

  /**
   * Rutas de analytics
   */
  readonly analytics = {
    systemOverview: `${this.baseUrl}/analytics/system-overview`
  };

  /**
   * Rutas de agendas
   */
  readonly agendas = {
    list: `${this.baseUrl}/agendas/`,
    getById: (id: number) => `${this.baseUrl}/agendas/${id}`,
    create: `${this.baseUrl}/agendas/`,
    update: (id: number) => `${this.baseUrl}/agendas/${id}`,
    delete: (id: number) => `${this.baseUrl}/agendas/${id}`
  };

  /**
   * Rutas de notificaciones
   */
  readonly notifications = {
    list: `${this.baseUrl}/notifications/`,
    getById: (id: number) => `${this.baseUrl}/notifications/${id}`,
    markAsRead: (id: number) => `${this.baseUrl}/notifications/${id}/mark-as-read`,
    markAllAsRead: `${this.baseUrl}/notifications/mark-all-as-read`
  };

  constructor() { }

  /**
   * Obtiene la URL base de la API
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
