import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { CreateServiceComponent } from './create-service/create-service.component';
import { EditServiceComponent } from './edit-service/edit-service.component';
import { DeleteServiceComponent } from './delete-service/delete-service.component';
import { BusinessServicesService } from '../../services/business-services.service';
import { EstablishmentsService } from '../../services/establishments.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CreateServiceComponent,
    EditServiceComponent,
    DeleteServiceComponent
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {

  services: any[] = [];
  filteredServices: any[] = [];
  establishments: any[] = [];

  searchTerm: string = '';

  loading = false;

  showModal = false;
  showDeleteModal = false;
  showCreateModal = false;

  selectedId!: number;

  constructor(
    private servicesService: BusinessServicesService,
    private establishmentsService: EstablishmentsService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {

    this.loading = true;

    forkJoin({
      services: this.servicesService.getServices(),
      establishments: this.establishmentsService.getEstablishments()
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

        this.filteredServices = [...this.services]; 

        this.loading = false;
      },

      error: (err) => {
        console.error('Error cargando servicios:', err);
        this.loading = false;
      }

    });

  }

  onSearch() {

    const term = this.searchTerm.toLowerCase();

    this.filteredServices = this.services.filter(service =>
      service.nombre?.toLowerCase().includes(term) ||
      service.establecimiento_nombre?.toLowerCase().includes(term)
    );

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