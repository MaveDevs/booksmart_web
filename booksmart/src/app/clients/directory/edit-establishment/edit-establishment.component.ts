import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-establishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-establishment.component.html',
  styleUrl: './edit-establishment.component.css'
})
export class EditEstablishmentComponent {

  @Input() establishmentId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  establishment: any = {
    nombre: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    latitud: 0,
    longitud: 0,
    activo: true
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadEstablishment();
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

  loadEstablishment() {

    this.http
      .get<any>(`${this.apiUrl}/establishments/${this.establishmentId}`, {
        headers: this.getHeaders()
      })
      .subscribe({
        next: (data) => {
          this.establishment = data;
        }
      });

  }

  updateEstablishment() {

    this.http
      .put(
        `${this.apiUrl}/establishments/${this.establishmentId}`,
        this.establishment,
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: () => {
          alert('Establecimiento actualizado');
          this.updated.emit();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar');
        }
      });

  }

  closeModal() {
    this.close.emit();
  }

}