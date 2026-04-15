import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { AppointmentsService } from '../../../services/appointments.service';
import { BusinessServicesService } from '../../../services/business-services.service';
import { UsersService } from '../../../services/users.service';
import { EstablishmentsService } from '../../../services/establishments.service';
import { WorkersService } from '../../../services/workers.service';

@Component({
  selector: 'app-create-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.css']
})
export class CreateAppointmentComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  appointment: any = {
    cliente_id: '',
    servicio_id: '',
    trabajador_id: null,
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'PENDIENTE'
  };

  users: any[] = [];
  services: any[] = [];
  establishments: any[] = [];
  workers: any[] = [];

  selectedService: any = null;
  selectedHour: string | null = null;
  calendarInstance: any;

  availableSlots: Array<{ hour: string; status: 'available' | 'occupied' | 'closed' }> = [];
  availabilityClosed = false;
  availabilityMessage = '';
  workerCount = 0;

  days = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

  constructor(
    private appointmentsService: AppointmentsService,
    private servicesService: BusinessServicesService,
    private usersService: UsersService,
    private establishmentsService: EstablishmentsService,
    private workersService: WorkersService,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  initCalendar(){

    if(this.calendarInstance){
      this.calendarInstance.destroy();
    }

    this.calendarInstance = flatpickr("#calendarInput", {
      locale: Spanish,
      minDate: "today",
      maxDate: new Date(new Date().setDate(new Date().getDate() + 90)),

      onChange: (dates) => {
        if (dates.length) {
          const d = dates[0];

          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');

          this.appointment.fecha = `${y}-${m}-${day}`;
          this.selectedHour = null;

          this.loadAvailability();
          this.cd.detectChanges();
        }
      }
    });
  }

  loadData() {

    this.usersService.getUsers()
      .subscribe(data => this.users = data.filter(u => u.rol_id === 1));

    this.servicesService.getServices()
      .subscribe(data => this.services = data);

    this.establishmentsService.getEstablishments()
      .subscribe(data => this.establishments = data);

    this.initCalendar();
  }

  onServiceChange() {
    this.selectedService = this.services.find(
      s => s.servicio_id == this.appointment.servicio_id
    );

    this.appointment.trabajador_id = null;
    this.selectedHour = null;
    this.availableSlots = [];
    this.availabilityMessage = '';
    this.availabilityClosed = false;

    if (this.selectedService?.establecimiento_id) {
      this.workersService.getWorkers(this.selectedService.establecimiento_id)
        .subscribe(data => this.workers = data);
    }

    this.loadAvailability();
  }

  getEstablishmentName(id:number){
    return this.establishments.find(e => e.establecimiento_id === id)?.nombre || '—';
  }

  loadAvailability() {
    if (!this.appointment.fecha || !this.appointment.servicio_id) {
      return;
    }

    this.availableSlots = [];
    this.availabilityMessage = '';
    this.availabilityClosed = false;

    const workerId = this.appointment.trabajador_id || null;

    this.appointmentsService
      .getAvailableSlots(this.appointment.servicio_id, this.appointment.fecha, workerId)
      .subscribe({
        next: (res: any) => {
          this.workerCount = res.worker_count || 0;

          if (res.closed) {
            this.availabilityClosed = true;
            this.availabilityMessage = res.closure_reason || 'No hay disponibilidad para esta fecha';
            this.availableSlots = [];
            return;
          }

          const duration = Number(this.selectedService?.duracion || 30);
          const allSlots = this.buildSlotGrid(duration);
          const available = new Set<string>(res.available_slots || []);
          const busy = new Set<string>(res.busy_slots || []);

          this.availableSlots = allSlots.map((hour) => ({
            hour,
            status: available.has(hour)
              ? 'available'
              : busy.has(hour)
                ? 'occupied'
                : 'closed'
          }));

          if (!this.availableSlots.some(slot => slot.status === 'available')) {
            this.availabilityMessage = res.closure_reason || 'No hay horarios disponibles para este servicio.';
          }
        },
        error: (err) => {
          console.error('Error cargando disponibilidad:', err);
          this.availabilityMessage = err?.error?.detail || 'No se pudo cargar la disponibilidad';
        }
      });
  }

  private buildSlotGrid(durationMinutes: number): string[] {
    const slots: string[] = [];
    const startMinutes = 8 * 60;
    const endMinutes = 19 * 60;

    for (let current = startMinutes; current + durationMinutes <= endMinutes; current += durationMinutes) {
      slots.push(this.formatMinutes(current));
    }

    return slots;
  }

  private formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private toTimeString(hour: string): string {
    return `${hour}:00`;
  }

  private calculateEndTime(hour: string, durationMinutes: number): string {
    const [h, m] = hour.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    return `${this.formatMinutes(totalMinutes)}:00`;
  }

  onSelectSlot(slot:any){

    if(slot.status !== 'available') return;

    this.selectedHour = slot.hour;
    this.appointment.hora_inicio = this.toTimeString(slot.hour);
    this.appointment.hora_fin = this.calculateEndTime(
      slot.hour,
      Number(this.selectedService?.duracion || 30)
    );
    this.appointment.trabajador_id = null;

    this.cd.detectChanges();
  }

  createAppointment() {
    if (!this.appointment.cliente_id || !this.appointment.servicio_id || !this.appointment.fecha || !this.appointment.hora_inicio) {
      return;
    }

    this.appointment.trabajador_id = null;

    this.appointmentsService.createAppointment(this.appointment).subscribe({
      next: () => {
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error('Error creando cita:', err);
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}