import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends ApiClientService {

  constructor(
    http: HttpClient,
    private apiConfig: ApiConfigService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(http, platformId);
  }

  /**
   * Obtener lista de usuarios
   */
  getUsers(): Observable<any[]> {
    return this.get(this.apiConfig.users.list);
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(id: number): Observable<any> {
    return this.getById(this.apiConfig.users.getById(id));
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(data: any): Observable<any> {
    return this.post(this.apiConfig.users.create, data);
  }

  /**
   * Actualizar un usuario
   */
  updateUser(id: number, data: any): Observable<any> {
    return this.put(this.apiConfig.users.update(id), data);
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(id: number): Observable<any> {
    return this.delete(this.apiConfig.users.delete(id));
  }
}
