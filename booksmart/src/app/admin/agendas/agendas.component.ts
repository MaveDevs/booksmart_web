import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CreateAgendaComponent } from './create-agenda/create-agenda.component';
import { EditAgendaComponent } from './edit-agenda/edit-agenda.component';
import { DeleteAgendaComponent } from './delete-agenda/delete-agenda.component';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateAgendaComponent,
    EditAgendaComponent,
    DeleteAgendaComponent
  ],
  templateUrl: './agendas.component.html',
  styleUrls: ['./agendas.component.css']
})
export class AgendasComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  view: 'calendar' | 'schedules' = 'calendar';

  days = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

  hours: string[] = [];

  appointments:any[] = [];
  services:any[] = [];
  establishments:any[] = [];

  agendas:any[] = [];
  filteredAgendas:any[] = [];
  filteredAppointments:any[] = [];

  selectedEstablishment:number | null = null;

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedId!: number;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    this.hours = this.generateTimeSlots();
    this.loadAll();
    this.loadAgendas();
  }

  setView(view:'calendar'|'schedules'){
    this.view = view;
  }

  getHeaders(){
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
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

  loadAll(){

    forkJoin({
      appointments: this.http.get<any[]>(`${this.apiUrl}/appointments/`, { headers:this.getHeaders() }),
      services: this.http.get<any[]>(`${this.apiUrl}/services/`, { headers:this.getHeaders() }),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers:this.getHeaders() })
    }).subscribe(res=>{
      this.appointments = res.appointments;
      this.services = res.services;
      this.establishments = res.establishments;
      this.applyFilter();
    });

  }

  loadAgendas(){
    this.http.get<any[]>(`${this.apiUrl}/agendas/`, {
      headers:this.getHeaders()
    }).subscribe(data=>{
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

  getEstablishmentName(id:number){
    const est = this.establishments.find(e => e.establecimiento_id === id);
    return est ? est.nombre : '—';
  }

  getDayName(date: string){

    const [year, month, day] = date.split('-').map(Number);

    const localDate = new Date(year, month - 1, day); // 👈 LOCAL

    return this.days[localDate.getDay()];
  }

  isOccupied(day:string, time:string){

    return this.filteredAppointments.some(cita => {

      if(!cita.fecha || !cita.hora_inicio || !cita.hora_fin) return false;

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

    return this.filteredAgendas.some(agenda => {

      const start = agenda.hora_inicio.substring(0,5);
      const end = agenda.hora_fin.substring(0,5);

      return agenda.dia_semana === day && time >= start && time < end;

    });

  }

  isAvailable(day:string, time:string){
    return this.isWorking(day, time) && !this.isOccupied(day, time);
  }

  selectSlot(day:string, time:string){
    alert(`Crear cita en ${day} ${time}`);
  }

  openCreate(){
    this.showCreateModal = true;
  }

  openEdit(id:number){
    this.selectedId = id;
    this.showEditModal = true;
  }

  openDelete(id:number){
    this.selectedId = id;
    this.showDeleteModal = true;
  }

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