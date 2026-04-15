import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-payment.component.html',
  styleUrls: ['./edit-payment.component.css']
})
export class EditPaymentComponent implements OnInit {

  @Input() paymentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  showSuccess: boolean = false; 

  private apiUrl = environment.apiUrl;

  payment: any = {
    suscripcion_id: '',
    monto: '',
    metodo_pago: 'TARJETA_CREDITO',
    estado: 'PENDIENTE'
  };

  subscriptions: any[] = [];
  plans: any[] = [];
  establishments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {

    forkJoin({
      payment: this.http.get<any>(`${this.apiUrl}/payments/${this.paymentId}/`),
      subscriptions: this.http.get<any[]>(`${this.apiUrl}/subscriptions/`),
      plans: this.http.get<any[]>(`${this.apiUrl}/plans/`),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`)
    }).subscribe({

      next: (res: any) => {

        const payment = res.payment;
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

        this.payment = {
          suscripcion_id: payment.suscripcion_id,
          monto: payment.monto,
          metodo_pago: payment.metodo_pago,
          estado: payment.estado
        };

      },

      error: (err) => console.error(err)

    });

  }

  update() {

    if (!this.payment.suscripcion_id) {
      alert('Selecciona una suscripción');
      return;
    }

    if (!this.payment.monto || this.payment.monto <= 0) {
      alert('Monto inválido');
      return;
    }

    const payload = {
      suscripcion_id: Number(this.payment.suscripcion_id),
      monto: Number(this.payment.monto),
      metodo_pago: String(this.payment.metodo_pago).toUpperCase().trim(),
      estado: String(this.payment.estado).toUpperCase().trim()
    };

    this.http.put(`${this.apiUrl}/payments/${this.paymentId}/`, payload)
      .subscribe({
        next: () => {

          this.showSuccess = true;

          setTimeout(() => {
            this.showSuccess = false;
            this.updated.emit();
          }, 2000);

        },
        error: (err) => console.error('ERROR BACKEND:', err.error?.detail)
      });

  }

  closeModal() {
    this.close.emit();
  }
}