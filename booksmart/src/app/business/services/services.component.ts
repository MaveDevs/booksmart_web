import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { CreateServiceComponent } from './create-service/create-service.component';
import { EditServiceComponent } from './edit-service/edit-service.component';
import { DeleteServiceComponent } from './delete-service/delete-service.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    CreateServiceComponent,
    EditServiceComponent,
    DeleteServiceComponent
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  private apiUrl = 'http://localhost:8000/api/v1';

  services: any[] = [];
  establishments: any[] = [];

  loading = false;

  showModal = false;
  showDeleteModal = false;
  showCreateModal = false;

  selectedId!: number;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAllData();
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

  loadAllData() {

    this.loading = true;

    forkJoin({
      services: this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() }),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers: this.getHeaders() })
    }).subscribe({

      next: (res: any) => {

        this.establishments = res.establishments;

        this.services = res.services.map((service: any) => {

          const est = this.establishments.find(
            (e: any) => e.establecimiento_id === service.establecimiento_id
          );

          return {
            ...service,
            establecimiento_nombre: est ? est.nombre : 'Sin establecimiento'
          };

        });

        this.loading = false;
      },

      error: (err) => {
        console.error('Error cargando servicios:', err);
        this.loading = false;
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
    this.loadAllData();
  }

  editService(service: any) {
    this.selectedId = service.servicio_id;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  reloadAfterUpdate() {
    this.closeModal();
    this.loadAllData();
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
    this.loadAllData();
  }

}