import { Component, EventEmitter, Output, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";

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

  apiUrl = 'http://localhost:8000/api/v1';

  appointment: any = {
    cliente_id: '',
    servicio_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'PENDIENTE'
  };

  users: any[] = [];
  services: any[] = [];
  establishments: any[] = [];
  agendas: any[] = [];
  appointments: any[] = [];

  selectedService: any = null;
  selectedHour: string | null = null;
  calendarInstance: any;

  availableSlots: any[] = []; 

  days = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  hours: string[] = [];

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.hours = this.generateTimeSlots();
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

      disable: [
        (date: Date) => {
          const dayName = this.days[date.getDay()];
          return !this.agendas.some(a =>
            a.dia_semana.toUpperCase() === dayName.toUpperCase()
          );
        }
      ],

      onChange: (dates) => {
        if (dates.length) {
          const d = dates[0];

          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');

          this.appointment.fecha = `${y}-${m}-${day}`;
          this.selectedHour = null;

          this.updateSlots(); 
          this.cd.detectChanges();
        }
      }
    });
  }

  updateSlots(){
    this.availableSlots = this.getAvailableSlots();
  }

  getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  generateTimeSlots(){
    const slots:string[] = [];
    for(let h = 8; h <= 19; h++){
      slots.push(`${String(h).padStart(2,'0')}:00`);
      slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    return slots;
  }

  loadData() {

    this.http.get<any[]>(`${this.apiUrl}/users/`, { headers: this.getHeaders() })
      .subscribe(data => this.users = data.filter(u => u.rol_id === 1));

    this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() })
      .subscribe(data => this.services = data);

    this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers: this.getHeaders() })
      .subscribe(data => this.establishments = data);

    this.http.get<any[]>(`${this.apiUrl}/appointments/`, { headers: this.getHeaders() })
      .subscribe(data => this.appointments = data);

    this.http.get<any[]>(`${this.apiUrl}/agendas/`, { headers: this.getHeaders() })
      .subscribe(data => {
        this.agendas = data;

        setTimeout(() => {
          this.initCalendar();
          this.updateSlots(); 
        }, 0);
      });
  }

  onServiceChange() {
    this.selectedService = this.services.find(
      s => s.servicio_id == this.appointment.servicio_id
    );
  }

  getEstablishmentName(id:number){
    return this.establishments.find(e => e.establecimiento_id === id)?.nombre || '—';
  }

  getAvailableSlots(){

    if(!this.appointment.fecha) return [];

    const selectedDate = new Date(this.appointment.fecha + 'T00:00:00');
    const today = new Date();

    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    const dayName = this.days[selectedDate.getDay()];

    let now: Date | null = null;

    if(isToday){
      now = new Date();
      now.setMinutes(now.getMinutes() + 30);
    }

    return this.hours
      .map(hour => {

        const [h, m] = hour.split(':').map(Number);

        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(h, m, 0, 0);

        if(isToday && now && slotDateTime <= now){
          return null;
        }

        const inAgenda = this.agendas.some(a => {
          if(a.dia_semana.toUpperCase() !== dayName.toUpperCase()) return false;

          const start = a.hora_inicio.substring(0,5);
          const end = a.hora_fin.substring(0,5);

          return hour >= start && hour < end;
        });

        const occupied = this.appointments.some(cita => {

          if(!cita.fecha) return false;

          const citaDate = cita.fecha.substring(0,10);
          if(citaDate !== this.appointment.fecha) return false;

          const start = cita.hora_inicio.substring(0,5);
          const end = cita.hora_fin.substring(0,5);

          return hour >= start && hour < end;
        });

        return {
          hour,
          status: !inAgenda ? 'closed'
                 : occupied ? 'occupied'
                 : 'available'
        };
      })
      .filter(slot => slot !== null);
  }

  onSelectSlot(slot:any){

    if(slot.status !== 'available') return;

    this.selectedHour = slot.hour;
    this.appointment.hora_inicio = slot.hour;

    const [h,m] = slot.hour.split(':').map(Number);
    const end = new Date();
    end.setHours(h, m + 30);

    this.appointment.hora_fin =
      `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;

    this.updateSlots(); 
    this.cd.detectChanges();
  }

  createAppointment() {
    this.http.post(`${this.apiUrl}/appointments/`, this.appointment, {
      headers: this.getHeaders()
    }).subscribe(() => {
      this.created.emit();
      this.close.emit();
    });
  }

  closeModal() {
    this.close.emit();
  }
}