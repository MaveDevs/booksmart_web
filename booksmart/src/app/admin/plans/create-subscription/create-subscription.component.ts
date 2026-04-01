import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.css']
})
export class CreateSubscriptionComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  establishments: any[] = [];
  plans: any[] = [];

  subscription: any = {
    establecimiento_id: null,
    plan_id: null
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>(`${this.apiUrl}/establishments/`)
      .subscribe(res => this.establishments = res);

    this.http.get<any[]>(`${this.apiUrl}/plans/`)
      .subscribe(res => this.plans = res);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  create() {

    if (!this.subscription.establecimiento_id || !this.subscription.plan_id) {
      alert('Selecciona establecimiento y plan');
      return;
    }

    const hoy = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 1);

    const data = {
      establecimiento_id: Number(this.subscription.establecimiento_id),
      plan_id: Number(this.subscription.plan_id),
      estado: 'ACTIVA',
      fecha_inicio: this.formatDate(hoy), 
      fecha_fin: this.formatDate(fin)     
    };

    console.log(' ENVIANDO:', data);

    this.http.post(`${this.apiUrl}/subscriptions/`, data).subscribe({
      next: (res) => {
        console.log('SUSCRIPCIÓN CREADA:', res);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        console.error(' ERROR:', err);
        console.log('BACKEND:', err.error);
        alert(JSON.stringify(err.error));
      }
    });
  }

  closeModal() {
    this.close.emit();
  }
}