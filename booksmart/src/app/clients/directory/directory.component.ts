import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

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

  showDeleteModal = false;
  showEditModal = false;
  showCreateModal = false;

  selectedId!: number;

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

    this.http
      .get<any[]>(`${this.apiUrl}/establishments/`, {
        headers: this.getHeaders()
      })
      .subscribe({
        next: (data) => {
          this.establishments = data;
        },
        error: (err) => {
          console.error('Error cargando establecimientos', err);
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
    this.loadEstablishments();
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
    this.loadEstablishments();
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
    this.loadEstablishments();
  }

}