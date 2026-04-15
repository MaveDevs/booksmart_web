import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  client: any = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rol_id: 3,
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

  createClient(){

    this.http.post(
      `${this.apiUrl}/users/`,
      this.client,
      { headers:this.getHeaders() }
    ).subscribe({

      next:()=>{
        this.created.emit();
        this.close.emit();
      },

      error:(err)=>console.error(err)
    });

  }

  closeModal(){
    this.close.emit();
  }
}