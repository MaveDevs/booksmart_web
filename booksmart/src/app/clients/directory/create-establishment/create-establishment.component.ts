import { Component, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-establishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-establishment.component.html',
  styleUrl: './create-establishment.component.css'
})
export class CreateEstablishmentComponent {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  establishment: any = {
    nombre: '',
    descripcion: '',
    direccion: '',
    latitud: 0,
    longitud: 0,
    telefono: '',
    usuario_id: 0,
    activo: true
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders() {

    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createEstablishment() {

    this.http
      .post(
        `${this.apiUrl}/establishments/`,
        this.establishment,
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: () => {
          alert('Establecimiento creado correctamente');
          this.created.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear establecimiento');
        }
      });

  }

  closeModal() {
    this.close.emit();
  }

}