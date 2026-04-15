import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {

  constructor(
    protected http: HttpClient,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) { }

  /**
   * Obtiene los headers con autenticación
   */
  protected getHeaders(): HttpHeaders {
    let token = '';
    
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * GET - Obtener lista de recursos
   */
  protected get<T>(url: string): Observable<T> {
    return this.http.get<T>(url, { headers: this.getHeaders() });
  }

  /**
   * GET - Obtener un recurso por ID
   */
  protected getById<T>(url: string): Observable<T> {
    return this.http.get<T>(url, { headers: this.getHeaders() });
  }

  /**
   * POST - Crear un nuevo recurso
   */
  protected post<T>(url: string, data: any): Observable<T> {
    return this.http.post<T>(url, data, { headers: this.getHeaders() });
  }

  /**
   * PUT - Actualizar un recurso
   */
  protected put<T>(url: string, data: any): Observable<T> {
    return this.http.put<T>(url, data, { headers: this.getHeaders() });
  }

  /**
   * DELETE - Eliminar un recurso
   */
  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url, { headers: this.getHeaders() });
  }
}
