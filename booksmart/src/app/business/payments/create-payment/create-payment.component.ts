import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface PaymentForm {
  suscripcion_id: number | null;
  monto: number;
  metodo_pago: string;
  estado: string;
}

@Component({
  selector: 'app-create-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.css']
})
export class CreatePaymentComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private apiUrl = environment.apiUrl;

  subscriptions: any[] = [];
  plans: any[] = [];
  establishments: any[] = [];

  payment: PaymentForm = {
    suscripcion_id: null,
    monto: 0,
    metodo_pago: 'TARJETA_CREDITO',
    estado: 'PENDIENTE'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {

    forkJoin({
      subscriptions: this.http.get<any[]>(`${this.apiUrl}/subscriptions/`),
      plans: this.http.get<any[]>(`${this.apiUrl}/plans/`),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`)
    }).subscribe({

      next: (res: any) => {

        this.plans = res.plans;
        this.establishments = res.establishments;

        this.subscriptions = res.subscriptions.map((sub: any) => {

          const plan = this.plans.find(p => p.plan_id === sub.plan_id);
          const est = this.establishments.find(e => e.establecimiento_id === sub.establecimiento_id);

          return {
            ...sub,
            label: `${est?.nombre || 'Negocio'} - ${plan?.nombre || 'Plan'}`
          };

        });

      },

      error: (err) => console.error(err)

    });

  }

  create() {

    if (!this.payment.suscripcion_id) {
      alert('Selecciona una suscripción');
      return;
    }

    if (!this.payment.monto || this.payment.monto <= 0) {
      alert('Monto inválido');
      return;
    }

    const payload = {
      suscripcion_id: this.payment.suscripcion_id,
      monto: this.payment.monto,
      metodo_pago: this.payment.metodo_pago.toUpperCase().trim(),
      estado: this.payment.estado.toUpperCase().trim()
    };

    console.log('PAYLOAD:', payload);

    this.http.post(`${this.apiUrl}/payments/`, payload)
      .subscribe({
        next: () => this.created.emit(),
        error: (err) => console.error('ERROR:', err.error?.detail)
      });

  }

  closeModal() {
    this.close.emit();
  }
}