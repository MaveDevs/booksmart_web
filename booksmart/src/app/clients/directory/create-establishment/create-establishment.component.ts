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

  logoFile: File | null = null;
  portadaFile: File | null = null;

  logoPreview: string | null = null;
  portadaPreview: string | null = null;

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
    descripcion_publica: ''
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
    this.http.get(`${this.apiUrl}/users/`, { headers: this.getHeaders() })
      .subscribe({
        next: (data: any) => this.users = data,
        error: (err) => console.error("Error usuarios", err)
      });
  }

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (type === 'logo') {
        this.logoFile = file;
        this.logoPreview = reader.result as string;
      }
      if (type === 'portada') {
        this.portadaFile = file;
        this.portadaPreview = reader.result as string;
      }
    };

    reader.readAsDataURL(file);
  }

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'upload_establecimientos');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/da8ohqavz/image/upload',
      { method: 'POST', body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  }

  async createEstablishment() {
    try {

      const estRes: any = await this.http.post(
        `${this.apiUrl}/establishments/`,
        this.establishment,
        { headers: this.getHeaders() }
      ).toPromise();

      const id = estRes.establecimiento_id;

      const logoUrl = this.logoFile ? await this.uploadImage(this.logoFile) : '';
      const portadaUrl = this.portadaFile ? await this.uploadImage(this.portadaFile) : '';

      await this.http.post(`${this.apiUrl}/profiles/`, {
        establecimiento_id: id,
        descripcion_publica: this.profile.descripcion_publica,
        imagen_logo: logoUrl,
        imagen_portada: portadaUrl
      }, { headers: this.getHeaders() }).toPromise();

      await this.http.post(`${this.apiUrl}/agendas/`, {
        establecimiento_id: id,
        dia_semana: this.agenda.dia_semana || 'LUNES',
        hora_inicio: this.agenda.hora_inicio || '09:00',
        hora_fin: this.agenda.hora_fin || '18:00'
      }, { headers: this.getHeaders() }).toPromise();

      this.created.emit();
      this.close.emit();

    } catch (error) {
      console.error("ERROR ❌", error);
    }
  }

  closeModal() {
    this.close.emit();
  }
}