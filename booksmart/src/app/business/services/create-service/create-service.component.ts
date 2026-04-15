import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessServicesService } from '../../../services/business-services.service';
import { EstablishmentsService } from '../../../services/establishments.service';

@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-service.component.html',
  styleUrl: './create-service.component.css'
})
export class CreateServiceComponent implements OnInit {

  establishments: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  service = {
    establecimiento_id: 0,
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    activo: true
  };

  constructor(
    private servicesService: BusinessServicesService,
    private establishmentsService: EstablishmentsService
  ) {}

  ngOnInit(): void {
    this.loadEstablishments();
  }

  loadEstablishments() {

    this.establishmentsService.getEstablishments().subscribe({
      next: (data) => {
        this.establishments = data;
      },
      error: (err) => {
        console.error('Error cargando establecimientos', err);
      }
    });

  }

  createService() {

    this.servicesService.createService(this.service).subscribe({
      next: () => {
        this.created.emit();
      },
      error: (err) => {
        console.error('Error creando servicio', err);
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}