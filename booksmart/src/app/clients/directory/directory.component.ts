import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { DeleteEstablishmentComponent } from './delete-establishment/delete-establishment.component';
import { EditEstablishmentComponent } from './edit-establishment/edit-establishment.component';
import { CreateEstablishmentComponent } from './create-establishment/create-establishment.component';
import { RatingsComponent } from './ratings/ratings.component';
import { AllRatingsComponent } from './all-ratings/all-ratings.component';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RatingsComponent,
    DeleteEstablishmentComponent,
    EditEstablishmentComponent,
    CreateEstablishmentComponent,
    AllRatingsComponent
  ],
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.css']
})
export class DirectoryComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  establishments: any[] = [];
  filteredEstablishments: any[] = [];

  profiles: any[] = [];
  agendas: any[] = [];

  searchTerm: string = '';

  showDeleteModal = false;
  showEditModal = false;
  showCreateModal = false;

  showRatingModal = false;
  selectedEstablishmentId!: number;
  selectedId!: number;

  showAllRatingsModal = false;
  selectedEstablishmentForAll!: number;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers: this.getHeaders() }),
      profiles: this.http.get<any[]>(`${this.apiUrl}/profiles/`, { headers: this.getHeaders() }),
      agendas: this.http.get<any[]>(`${this.apiUrl}/agendas/`, { headers: this.getHeaders() }),
      ratings: this.http.get<any[]>(`${this.apiUrl}/ratings/`, { headers: this.getHeaders() })
    }).subscribe(res => {

      this.profiles = res.profiles;
      this.agendas = res.agendas;

      const ratings = res.ratings;

      this.establishments = res.establishments.map(est => {

        const profile = this.profiles.find(p => p.establecimiento_id === est.establecimiento_id);
        const agendas = this.agendas.filter(a => a.establecimiento_id === est.establecimiento_id);
        const ratingsDelNegocio = ratings.filter(r => r.establecimiento_id === est.establecimiento_id);

        const totalRatings = ratingsDelNegocio.length;

        const promedio =
          totalRatings > 0
            ? (
                ratingsDelNegocio.reduce((sum, r) => sum + r.calificacion, 0) /
                totalRatings
              ).toFixed(1)
            : 0;

        return {
          ...est,
          descripcion_publica: profile?.descripcion_publica || 'Sin perfil',
          imagen_logo: profile?.imagen_logo || '',
          imagen_portada: profile?.imagen_portada || '',
          agendas: agendas,
          rating_promedio: promedio,
          rating_total: totalRatings
        };

      });

      this.filteredEstablishments = [...this.establishments];
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();

    this.filteredEstablishments = this.establishments.filter(business => {
      const estado = business.activo ? 'activo' : 'inactivo';

      return (
        business.nombre?.toLowerCase().includes(term) ||
        business.direccion?.toLowerCase().includes(term) ||
        business.telefono?.toLowerCase().includes(term) ||
        estado.includes(term)
      );
    });
  }

  openRatingModal(id: number, event: Event) {
    event.stopPropagation();
    this.selectedEstablishmentId = id;
    this.showRatingModal = true;
  }

  closeRatingModal() {
    this.showRatingModal = false;
    this.loadData();
  }

  openAllRatingsModal(id: number, event: Event) {
    event.stopPropagation();
    this.selectedEstablishmentForAll = id;
    this.showAllRatingsModal = true;
    this.cdr.detectChanges(); 
  }

  closeAllRatingsModal() {
    this.showAllRatingsModal = false;
  }

  openCreateModal() { this.showCreateModal = true; }
  closeCreateModal() { this.showCreateModal = false; }
  reloadAfterCreate() { this.closeCreateModal(); this.loadData(); }

  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() { this.showDeleteModal = false; }
  reloadAfterDelete() { this.closeDeleteModal(); this.loadData(); }

  openEditModal(id: number) {
    this.selectedId = id;
    this.showEditModal = true;
  }

  closeEditModal() { this.showEditModal = false; }
  reloadAfterEdit() { this.closeEditModal(); this.loadData(); }

}