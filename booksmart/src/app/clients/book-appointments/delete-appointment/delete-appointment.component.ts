import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppointmentsService } from '../../../services/appointments.service';

@Component({
  selector: 'app-delete-appointment',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './delete-appointment.component.html',
  styleUrls: ['./delete-appointment.component.css']
})
export class DeleteAppointmentComponent {

  @Input() appointmentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  showSuccessCard: boolean = false;
  loading: boolean = false;

  constructor(
    private appointmentsService: AppointmentsService
  ) {}

  confirmDelete() {

    this.loading = true;

    this.appointmentsService.deleteAppointment(this.appointmentId).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccessCard = true;
        this.deleted.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error eliminando cita:', err);
      }
    });
  }

  closeModal() {
    if (!this.loading) {
      this.close.emit();
    }
  }
}