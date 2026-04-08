import { Component, EventEmitter, Output, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  selectedSlot: {day:string, time:string} | null = null;

  days = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  hours: string[] = [];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.hours = this.generateTimeSlots();
      this.loadData();
    }
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
      .subscribe(data => this.users = data.filter(u => u.rol_id === 3));

    this.http.get<any[]>(`${this.apiUrl}/services/`, { headers: this.getHeaders() })
      .subscribe(data => this.services = data);

    this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers: this.getHeaders() })
      .subscribe(data => this.establishments = data);

    this.http.get<any[]>(`${this.apiUrl}/agendas/`, { headers: this.getHeaders() })
      .subscribe(data => this.agendas = data);

    this.http.get<any[]>(`${this.apiUrl}/appointments/`, { headers: this.getHeaders() })
      .subscribe(data => this.appointments = data);
  }

  onServiceChange() {
    this.selectedService = this.services.find(
      s => s.servicio_id == this.appointment.servicio_id
    );
  }

  getEstablishmentName(id:number){
    const est = this.establishments.find(e => e.establecimiento_id === id);
    return est ? est.nombre : '—';
  }

  getDayName(date:string){
    const d = new Date(date);
    return this.days[d.getDay()];
  }

  isOccupied(day:string, time:string){
    return this.appointments.some(cita => {

      if(cita.estado === 'COMPLETADA' || cita.estado === 'CANCELADA'){
        return false;
      }

      const citaDay = this.getDayName(cita.fecha);
      const start = cita.hora_inicio.substring(0,5);
      const end = cita.hora_fin.substring(0,5);

      return citaDay === day && time >= start && time < end;
    });
  }

  isWorking(day:string, time:string){
    return this.agendas.some(agenda => {

      const start = agenda.hora_inicio.substring(0,5);
      const end = agenda.hora_fin.substring(0,5);

      return agenda.dia_semana === day && time >= start && time < end;
    });
  }

  isAvailable(day:string, time:string){
    return this.isWorking(day, time) && !this.isOccupied(day, time);
  }

  selectSlot(day:string, time:string){

    this.selectedSlot = { day, time };

    const today = new Date();
    const dayIndex = this.days.indexOf(day);
    const diff = (dayIndex - today.getDay() + 7) % 7;

    const selectedDate = new Date();
    selectedDate.setDate(today.getDate() + diff);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayNum = String(selectedDate.getDate()).padStart(2, '0');

    this.appointment.fecha = `${year}-${month}-${dayNum}`;

    this.appointment.hora_inicio = time;

    const [h,m] = time.split(':').map(Number);
    const end = new Date();
    end.setHours(h, m + 30);

    this.appointment.hora_fin =
      `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;
  }

  createAppointment() {
    this.http.post(`${this.apiUrl}/appointments/`, this.appointment, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.created.emit();
        this.close.emit();
      },
      error: err => console.error('Error creando cita', err)
    });
  }

  closeModal() {
    this.close.emit();
  }
}