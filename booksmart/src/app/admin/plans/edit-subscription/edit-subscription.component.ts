import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-subscription.component.html',
  styleUrls: ['./edit-subscription.component.css']
})
export class EditSubscriptionComponent implements OnInit {

  @Input() subId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  plans: any[] = [];

  subscription: any = {
    establecimiento_id: null,
    plan_id: null,
    estado: 'ACTIVA',
    fecha_inicio: '',
    fecha_fin: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {

    console.log(' SUB ID RECIBIDO:', this.subId);

    if (!this.subId) {
      alert('Error: no se recibió el ID');
      return;
    }

    this.loadData();
  }

  loadData() {

    this.http.get<any[]>(`${this.apiUrl}/plans/`)
      .subscribe(res => this.plans = res);

    this.http.get<any>(`${this.apiUrl}/subscriptions/${this.subId}`)
      .subscribe({
        next: (res) => {
          console.log(' SUB ACTUAL:', res);
          this.subscription = res;
        },
        error: (err) => {
          console.error(' ERROR AL CARGAR:', err);
        }
      });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onEstadoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.subscription.estado = input.checked ? 'ACTIVA' : 'CANCELADA';
  }

  update() {

    if (!this.subscription.plan_id) {
      alert('Selecciona un plan');
      return;
    }

    if (!this.subscription.establecimiento_id) {
      alert('Error: establecimiento no definido');
      return;
    }

    const hoy = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 1);

    const data = {
      establecimiento_id: Number(this.subscription.establecimiento_id),
      plan_id: Number(this.subscription.plan_id),
      estado: this.subscription.estado,
      fecha_inicio: this.formatDate(hoy),
      fecha_fin: this.formatDate(fin)
    };

    console.log('DATA FINAL:', data);

    this.http.put(`${this.apiUrl}/subscriptions/${this.subId}`, data)
      .subscribe({
        next: () => {
          console.log(' ACTUALIZADO');
          this.updated.emit();
          this.close.emit();
        },
        error: (err) => {
          console.error(' ERROR BACKEND:', err.error);
          alert(JSON.stringify(err.error));
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
}