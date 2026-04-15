import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BusinessServicesService } from '../../../services/business-services.service';

@Component({
  selector: 'app-delete-service',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './delete-service.component.html',
  styleUrls: ['./delete-service.component.css']
})
export class DeleteServiceComponent {

  @Input() serviceId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  showSuccessCard = false;

  constructor(
    private servicesService: BusinessServicesService
  ) {}

  deleteService() {

    this.servicesService.deleteService(this.serviceId).subscribe({

      next: () => {

        this.showSuccessCard = true;

        this.deleted.emit();

        setTimeout(() => {

          this.showSuccessCard = false;
          this.close.emit();

        }, 1500);

      },

      error: (err) => {
        console.error('Error eliminando servicio:', err);
      }

    });

  }

  closeModal() {
    this.close.emit();
  }

}