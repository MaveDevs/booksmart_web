import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-establishment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-establishment.component.html',
  styleUrls: ['./edit-establishment.component.css']
})
export class EditEstablishmentComponent implements OnChanges {

  @Input() establishmentId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  establishment: any = { activo: true };
  profile: any = {};
  agendas: any[] = [];
  users: any[] = [];

  logoFile: File | null = null;
  portadaFile: File | null = null;

  logoPreview: string | null = null;
  portadaPreview: string | null = null;

  showSuccessCard = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['establishmentId'] && this.establishmentId) {
      this.loadData();
    }
  }

  getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadData() {

    forkJoin({
      est: this.http.get(`${this.apiUrl}/establishments/${this.establishmentId}`),
      profiles: this.http.get<any[]>(`${this.apiUrl}/profiles/`),
      agendas: this.http.get<any[]>(`${this.apiUrl}/agendas/`),
      users: this.http.get<any[]>(`${this.apiUrl}/users/`)
    }).subscribe((res: any) => {

      this.establishment = {
        activo: true,
        ...res.est
      };

      this.profile = res.profiles.find(
        (p: any) => p.establecimiento_id === this.establishmentId
      ) || {};

      this.agendas = res.agendas.filter(
        (a: any) => a.establecimiento_id === this.establishmentId
      );

      this.users = res.users;

    });
  }

  addAgenda() {
    this.agendas.push({
      dia_semana: 'LUNES',
      hora_inicio: '09:00',
      hora_fin: '18:00'
    });
  }

  removeAgenda(index: number) {
    this.agendas.splice(index, 1);
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

  async updateEstablishment() {

    try {

      let logoUrl = this.profile.imagen_logo;
      let portadaUrl = this.profile.imagen_portada;

      if (this.logoFile) logoUrl = await this.uploadImage(this.logoFile);
      if (this.portadaFile) portadaUrl = await this.uploadImage(this.portadaFile);

      await this.http.put(
        `${this.apiUrl}/establishments/${this.establishmentId}`,
        this.establishment
      ).toPromise();

      if (this.profile.perfil_id) {
        await this.http.put(
          `${this.apiUrl}/profiles/${this.profile.perfil_id}`,
          {
            ...this.profile,
            imagen_logo: logoUrl,
            imagen_portada: portadaUrl
          }
        ).toPromise();
      }

      for (const agenda of this.agendas) {

        if (agenda.agenda_id) {
          await this.http.put(
            `${this.apiUrl}/agendas/${agenda.agenda_id}`,
            agenda
          ).toPromise();
        } else {
          await this.http.post(
            `${this.apiUrl}/agendas/`,
            {
              ...agenda,
              establecimiento_id: this.establishmentId
            }
          ).toPromise();
        }
      }

      this.showSuccessCard = true;
      this.updated.emit();

      setTimeout(() => {
        this.showSuccessCard = false;
        this.close.emit();
      }, 2000);

    } catch (err) {
      console.error(err);
    }
  }

  closeModal() {
    this.close.emit();
  }
}