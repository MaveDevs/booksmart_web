import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { DeleteEstablishmentComponent } from './delete-establishment/delete-establishment.component';
import { EditEstablishmentComponent } from './edit-establishment/edit-establishment.component';
import { CreateEstablishmentComponent } from './create-establishment/create-establishment.component';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DeleteEstablishmentComponent,
    EditEstablishmentComponent,
    CreateEstablishmentComponent
  ],
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  establishments: any[] = [];
  profiles: any[] = [];
  agendas: any[] = [];

  showDeleteModal = false;
  showEditModal = false;
  showCreateModal = false;

  selectedId!: number;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadData();
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

  loadData() {

    forkJoin({

      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
        headers: this.getHeaders()
      }),

      profiles: this.http.get<any[]>(`${this.apiUrl}/profiles/`, {
        headers: this.getHeaders()
      }),

      agendas: this.http.get<any[]>(`${this.apiUrl}/agendas/`, {
        headers: this.getHeaders()
      })

    }).subscribe({

      next: (res) => {

        this.profiles = res.profiles;
        this.agendas = res.agendas;

        this.establishments = res.establishments.map(est => {

          const profile = this.profiles.find(
            p => p.establecimiento_id === est.establecimiento_id
          );

          const agenda = this.agendas.find(
            a => a.establecimiento_id === est.establecimiento_id
          );

          return {
            ...est,
            descripcion_publica: profile?.descripcion_publica || 'Sin perfil',
            imagen_logo: profile?.imagen_logo || '',
            imagen_portada: profile?.imagen_portada || '',
            dia_semana: agenda?.dia_semana || 'Sin horario',
            hora_inicio: agenda?.hora_inicio || '',
            hora_fin: agenda?.hora_fin || ''
          };

        });

      },

      error: (err) => {
        console.error('Error cargando datos', err);
      }

    });

  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  reloadAfterCreate() {
    this.closeCreateModal();
    this.loadData();
  }

  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  reloadAfterDelete() {
    this.closeDeleteModal();
    this.loadData();
  }

  openEditModal(id: number) {
    this.selectedId = id;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  reloadAfterEdit() {
    this.closeEditModal();
    this.loadData();
  }

}