import { Component, EventEmitter, Output, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-service.component.html',
  styleUrl: './create-service.component.css'
})
export class CreateServiceComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  establishments: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  service = {
    establecimiento_id: 0,
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    activo: true
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadEstablishments();
  }

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

  loadEstablishments() {

    this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.establishments = data;
      },
      error: (err) => {
        console.error('Error cargando establecimientos', err);
      }
    });

  }

  createService() {

    this.http.post(`${this.apiUrl}/services/`, this.service, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.created.emit();
      },
      error: (err) => {
        console.error('Error creando servicio', err);
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}