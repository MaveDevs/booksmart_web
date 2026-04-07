import { Component, Output, EventEmitter, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-create-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-agenda.component.html',
  styleUrls: ['./create-agenda.component.css']
})
export class CreateAgendaComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  establishments: any[] = [];

  agenda = {
    establecimiento_id: null,
    dia_semana: '',
    hora_inicio: '',
    hora_fin: ''
  };

  loading = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    this.loadEstablishments();
  }

  getHeaders(){
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });
  }

  loadEstablishments(){
    this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
      headers:this.getHeaders()
    }).subscribe(data => this.establishments = data);
  }

  create(){

    if(
      !this.agenda.establecimiento_id ||
      !this.agenda.dia_semana ||
      !this.agenda.hora_inicio ||
      !this.agenda.hora_fin
    ){
      alert('Completa todos los campos');
      return;
    }

    this.loading = true;

    const payload = {
      ...this.agenda,
      hora_inicio: this.agenda.hora_inicio + ':00',
      hora_fin: this.agenda.hora_fin + ':00'
    };

    this.http.post(`${this.apiUrl}/agendas/`, payload, {
      headers:this.getHeaders()
    }).subscribe({
      next:()=>{
        this.loading = false;
        this.created.emit();
      },
      error:(err)=>{
        this.loading = false;
        console.error(err);
      }
    });

  }

}