import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BusinessServicesService } from '../../../services/business-services.service';

@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './edit-service.component.html',
  styleUrls: ['./edit-service.component.css']
})
export class EditServiceComponent implements OnChanges {

  @Input() serviceId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  service: any = {};

  showSuccessCard: boolean = false;

  constructor(
    private servicesService: BusinessServicesService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviceId'] && this.serviceId) {
      this.loadService();
    }
  }

  loadService() {

    this.servicesService.getServiceById(this.serviceId).subscribe({
      next: (data: any) => {
        this.service = data;
      },
      error: (err) => {
        console.error('Error cargando servicio:', err);
      }
    });

  }

  updateService() {

    this.servicesService.updateService(this.serviceId, this.service).subscribe({
      next: () => {

        this.showSuccessCard = true;

        this.updated.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 2000);

      },
      error: (err) => {
        console.error('Error actualizando servicio:', err);
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}