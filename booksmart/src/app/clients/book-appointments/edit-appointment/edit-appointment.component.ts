import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../../services/appointments.service';
import { BusinessServicesService } from '../../../services/business-services.service';
import { UsersService } from '../../../services/users.service';
import { EstablishmentsService } from '../../../services/establishments.service';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.css']
})
export class EditAppointmentComponent implements OnChanges {

  @Input() appointmentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  appointment: any = {};
  showSuccessCard = false;

  users:any[] = [];
  services:any[] = [];
  establishments:any[] = [];

  selectedService:any = null;

  estados = ['PENDIENTE','CONFIRMADA','CANCELADA','COMPLETADA'];

  constructor(
    private appointmentsService: AppointmentsService,
    private servicesService: BusinessServicesService,
    private usersService: UsersService,
    private establishmentsService: EstablishmentsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentId'] && this.appointmentId) {
      this.loadAll();
    }
  }

  loadAll(){

    this.usersService.getUsers()
      .subscribe(data => this.users = data);

    this.servicesService.getServices()
      .subscribe(data => this.services = data);

    this.establishmentsService.getEstablishments()
      .subscribe(data => this.establishments = data);

    this.loadAppointment();
  }

  loadAppointment() {

    this.appointmentsService.getAppointmentById(this.appointmentId).subscribe({
      next: (data: any) => {
        this.appointment = data;

     
        this.selectedService = this.services.find(
          s => s.servicio_id === this.appointment.servicio_id
        );
      }
    });
  }

  onServiceChange(){
    this.selectedService = this.services.find(
      s => s.servicio_id == this.appointment.servicio_id
    );
  }

  getEstablishmentName(id:number){
    const est = this.establishments.find(e => e.establecimiento_id === id);
    return est ? est.nombre : '—';
  }

  updateAppointment() {

    this.appointmentsService.updateAppointment(this.appointmentId, this.appointment).subscribe({
      next: () => {
        this.showSuccessCard = true;
        this.updated.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 2000);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}