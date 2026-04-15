import { Component, EventEmitter, Output, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.css']
})
export class CreateProfileComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  establishments: any[] = [];

  profile = {
    establecimiento_id: 0,
    descripcion_publica: '',
    imagen_logo: '',
    imagen_portada: ''
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

    this.http.get<any[]>(
      `${this.apiUrl}/establishments/`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data) => {
        this.establishments = data;
      },
      error: (err) => {
        console.error("Error cargando establecimientos", err);
      }
    });

  }

  createProfile() {

    if (this.profile.establecimiento_id === 0) {
      alert("Selecciona un establecimiento");
      return;
    }

    const data = {
      establecimiento_id: Number(this.profile.establecimiento_id),
      descripcion_publica: this.profile.descripcion_publica,
      imagen_logo: this.profile.imagen_logo,
      imagen_portada: this.profile.imagen_portada
    };

    this.http.post(
      `${this.apiUrl}/profiles/`,
      data,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        console.log("Perfil creado correctamente");
        this.created.emit();
      },
      error: (err) => {
        console.error("Error creando perfil", err.error);
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}