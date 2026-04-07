import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  private apiUrl = 'http://localhost:8000/api/v1';

  appointment: any = {};
  showSuccessCard = false;

  users:any[] = [];
  services:any[] = [];
  establishments:any[] = [];

  selectedService:any = null;

  estados = ['PENDIENTE','CONFIRMADA','CANCELADA','COMPLETADA'];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointmentId'] && this.appointmentId) {
      this.loadAll();
    }
  }

  getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadAll(){

    this.http.get<any[]>(`${this.apiUrl}/users/`, { headers:this.getHeaders() })
      .subscribe(data => this.users = data);

    this.http.get<any[]>(`${this.apiUrl}/services/`, { headers:this.getHeaders() })
      .subscribe(data => this.services = data);

    this.http.get<any[]>(`${this.apiUrl}/establishments/`, { headers:this.getHeaders() })
      .subscribe(data => this.establishments = data);

    this.loadAppointment();
  }

  loadAppointment() {

    this.http.get(`${this.apiUrl}/appointments/${this.appointmentId}/`, {
      headers: this.getHeaders()
    }).subscribe({
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

    this.http.put(
      `${this.apiUrl}/appointments/${this.appointmentId}/`,
      this.appointment,
      { headers: this.getHeaders() }
    ).subscribe({
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