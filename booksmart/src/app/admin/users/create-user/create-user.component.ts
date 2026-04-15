import { Component, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent {

  apiUrl = environment.apiUrl;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  user = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rol_id: 2,
    activo: true
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders(){

    let token = '';

    if(isPlatformBrowser(this.platformId)){
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });

  }

  createUser(){

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.post(
      `${this.apiUrl}/users/`,
      this.user,
      { headers:this.getHeaders() }
    ).subscribe({

      next: () => {

        this.created.emit();
        this.close.emit(); 

      },

      error: (err) => {
        console.error("Error creando usuario", err);
      }

    });

  }

  closeModal(){
    this.close.emit();
  }

}