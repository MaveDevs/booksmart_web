import { Component, Output, EventEmitter, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-establishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-establishment.component.html',
  styleUrls: ['./create-establishment.component.css']
})
export class CreateEstablishmentComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  users: any[] = []; 

  establishment: any = {
    nombre: '',
    descripcion: '',
    direccion: '',
    latitud: 0,
    longitud: 0,
    telefono: '',
    usuario_id: '',
    activo: true
  };

  profile: any = {
    descripcion_publica: '',
    imagen_logo: '',
    imagen_portada: ''
  };

  agenda: any = {
    dia_semana: '',
    hora_inicio: '',
    hora_fin: ''
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUsers();
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

  loadUsers() {

    this.http.get<any[]>(
      `${this.apiUrl}/users/`,
      { headers: this.getHeaders() }
    ).subscribe({

      next: (data) => {
        this.users = data;
      },

      error: (err) => {
        console.error("Error cargando usuarios", err);
      }

    });

  }

  createEstablishment() {

    this.http.post(
      `${this.apiUrl}/establishments/`,
      this.establishment,
      { headers: this.getHeaders() }
    ).subscribe({

      next: (data: any) => {

        const establishmentId = data.establecimiento_id;

        const profileData = {
          establecimiento_id: establishmentId,
          descripcion_publica: this.profile.descripcion_publica,
          imagen_logo: this.profile.imagen_logo,
          imagen_portada: this.profile.imagen_portada
        };

        this.http.post(
          `${this.apiUrl}/profiles/`,
          profileData,
          { headers: this.getHeaders() }
        ).subscribe({

          next: () => {

            const agendaData = {
              establecimiento_id: establishmentId,
              dia_semana: this.agenda.dia_semana,
              hora_inicio: this.agenda.hora_inicio,
              hora_fin: this.agenda.hora_fin
            };

            this.http.post(
              `${this.apiUrl}/agendas/`,
              agendaData,
              { headers: this.getHeaders() }
            ).subscribe({

              next: () => {
                this.created.emit();
                this.close.emit();
              },

              error: (err) => {
                console.error(err);
              }

            });

          },

          error: (err) => {
            console.error(err);
          }

        });

      },

      error: (err) => {
        console.error(err);
      }

    });

  }

  closeModal() {
    this.close.emit();
  }

}