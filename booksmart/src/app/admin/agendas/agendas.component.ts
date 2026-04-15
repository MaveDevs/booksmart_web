import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CreateAgendaComponent } from './create-agenda/create-agenda.component';
import { EditAgendaComponent } from './edit-agenda/edit-agenda.component';
import { DeleteAgendaComponent } from './delete-agenda/delete-agenda.component';
import { AppointmentsService } from '../../services/appointments.service';
import { BusinessServicesService } from '../../services/business-services.service';
import { EstablishmentsService } from '../../services/establishments.service';
import { UsersService } from '../../services/users.service';
import { AgendasService } from '../../services/agendas.service';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    CreateAgendaComponent,
    EditAgendaComponent,
    DeleteAgendaComponent
  ],
  templateUrl: './agendas.component.html',
  styleUrls: ['./agendas.component.css']
})
export class AgendasComponent implements OnInit {

  view: 'calendar' | 'schedules' = 'calendar';
  range: 'week' | 'month' | '3months' = 'week';

  days = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

  hours: string[] = [];
  visibleDates: Date[] = [];
  groupedDates: any[] = [];

  appointments:any[] = [];
  services:any[] = [];
  establishments:any[] = [];
  users:any[] = [];

  agendas:any[] = [];
  filteredAgendas:any[] = [];
  filteredAppointments:any[] = [];

  selectedEstablishment:number | null = null;

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedId!: number;

  selectedAppointment: any = null;
  showAppointmentModal = false;

  constructor(
    private appointmentsService: AppointmentsService,
    private servicesService: BusinessServicesService,
    private establishmentsService: EstablishmentsService,
    private usersService: UsersService,
    private agendasService: AgendasService
  ) {}

  ngOnInit(){
    this.hours = this.generateTimeSlots();
    this.generateDates();
    this.loadAll();
    this.loadAgendas();
  }

  setView(view:'calendar'|'schedules'){
    this.view = view;
  }

  setRange(range:'week'|'month'|'3months'){
    this.range = range;
    this.generateDates();
  }

  generateDates(){
    const today = new Date();
    let totalDays = 7;

    if(this.range === 'month') totalDays = 30;
    if(this.range === '3months') totalDays = 90;

    const dates: Date[] = [];

    for(let i = 0; i < totalDays; i++){
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }

    this.visibleDates = dates;
    this.groupDatesByMonth();
  }

  groupDatesByMonth(){
    const groups:any = {};

    this.visibleDates.forEach(date => {
      const month = date.toLocaleString('es-MX',{
        month:'long',
        year:'numeric'
      });

      if(!groups[month]) groups[month] = [];
      groups[month].push(date);
    });

    this.groupedDates = Object.keys(groups).map(m => ({
      month: m,
      dates: groups[m]
    }));
  }

  generateTimeSlots(){
    const slots:string[] = [];

    for(let h = 8; h <= 19; h++){
      slots.push(`${String(h).padStart(2,'0')}:00`);
      slots.push(`${String(h).padStart(2,'0')}:30`);
    }

    return slots;
  }

  loadAll(){
    forkJoin({
      appointments: this.appointmentsService.getAppointments(),
      services: this.servicesService.getServices(),
      establishments: this.establishmentsService.getEstablishments(),
      users: this.usersService.getUsers()
    }).subscribe(res=>{
      this.appointments = res.appointments;
      this.services = res.services;
      this.establishments = res.establishments;
      this.users = res.users;
      this.applyFilter();
    });
  }

  loadAgendas(){
    this.agendasService.getAgendas().subscribe(data=>{
      this.agendas = data;
      this.applyFilter();
    });
  }

  applyFilter(){
    if(!this.selectedEstablishment){
      this.filteredAppointments = this.appointments;
      this.filteredAgendas = this.agendas;
      return;
    }

    this.filteredAppointments = this.appointments.filter(cita=>{
      const service = this.services.find(s => s.servicio_id === cita.servicio_id);
      return service && service.establecimiento_id === this.selectedEstablishment;
    });

    this.filteredAgendas = this.agendas.filter(a =>
      a.establecimiento_id === this.selectedEstablishment
    );
  }

  formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
  }

  isOccupied(date: Date, time: string){
    const selectedDate = this.formatDateOnly(date);

    return this.filteredAppointments.some(cita => {
      if(!cita.fecha) return false;
      const citaDate = cita.fecha.split('T')[0];
      if(citaDate !== selectedDate) return false;

      const start = cita.hora_inicio.substring(0,5);
      const end = cita.hora_fin.substring(0,5);

      return time >= start && time < end;
    });
  }

  isAvailable(date: Date, time: string){
    return !this.isOccupied(date, time);
  }

  isInAgenda(date: Date, time: string){

    const dayName = this.days[date.getDay()];

    return this.filteredAgendas.some(a => {

      if(a.dia_semana !== dayName) return false;

      const start = a.hora_inicio.substring(0,5);
      const end = a.hora_fin.substring(0,5);

      return time >= start && time < end;
    });
  }

  selectSlot(date: Date, time: string){

    const selectedDate = this.formatDateOnly(date);

    const cita = this.filteredAppointments.find(c => {
      if(!c.fecha) return false;
      const citaDate = c.fecha.split('T')[0];
      if(citaDate !== selectedDate) return false;

      const start = c.hora_inicio.substring(0,5);
      const end = c.hora_fin.substring(0,5);

      return time >= start && time < end;
    });

    this.selectedAppointment = cita || null;
    this.showAppointmentModal = true;
  }

  closeAppointmentModal(){
    this.showAppointmentModal = false;
    this.selectedAppointment = null;
  }

  getClientName(cita:any){
    const user = this.users.find(u => u.usuario_id === cita?.cliente_id);

    if(!user) return `Cliente #${cita?.cliente_id}`;

    const nombre = user.nombre || '';
    const apellido = user.apellido || user.last_name || '';

    return `${nombre} ${apellido}`.trim();
  }

  getFecha(cita:any){
    return cita?.fecha ? new Date(cita.fecha).toLocaleDateString('es-MX') : '—';
  }

  getHora(cita:any){
    if(!cita?.hora_inicio || !cita?.hora_fin) return '—';
    return `${cita.hora_inicio.substring(0,5)} - ${cita.hora_fin.substring(0,5)}`;
  }

  getServiceName(id:number){
    return this.services.find(s => s.servicio_id === id)?.nombre || '—';
  }

  getServicePrice(id:number){
    return this.services.find(s => s.servicio_id === id)?.precio || '—';
  }

  getEstablishmentFromService(id:number){
    const s = this.services.find(x => x.servicio_id === id);
    return this.establishments.find(e => e.establecimiento_id === s?.establecimiento_id)?.nombre || '—';
  }

  getEstablishmentName(id:number){
    return this.establishments.find(e => e.establecimiento_id === id)?.nombre || '—';
  }

  openCreate(){ this.showCreateModal = true; }
  openEdit(id:number){ this.selectedId = id; this.showEditModal = true; }
  openDelete(id:number){ this.selectedId = id; this.showDeleteModal = true; }

  closeAll(){
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
  }

  reloadAll(){
    this.closeAll();
    this.loadAgendas();
    this.loadAll();
  }
}