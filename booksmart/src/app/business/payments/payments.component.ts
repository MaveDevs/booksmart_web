import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';

import { CreatePaymentComponent } from './create-payment/create-payment.component';
import { EditPaymentComponent } from './edit-payment/edit-payment.component';
import { DeletePaymentComponent } from './delete-payment/delete-payment.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreatePaymentComponent,
    EditPaymentComponent,
    DeletePaymentComponent
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  private apiUrl = environment.apiUrl;

  payments: any[] = [];
  filteredPayments: any[] = [];

  searchTerm: string = '';

  loading = false;

  showCreateModal = false;
  showDeleteModal = false;
  showEditModal = false;

  selectedId!: number;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {

    this.loading = true;

    forkJoin({
      payments: this.http.get<any[]>(`${this.apiUrl}/payments/`),
      subscriptions: this.http.get<any[]>(`${this.apiUrl}/subscriptions/`),
      plans: this.http.get<any[]>(`${this.apiUrl}/plans/`),
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`)
    }).subscribe({

      next: (res: any) => {

        const subscriptions = res.subscriptions;
        const plans = res.plans;
        const establishments = res.establishments;

        this.payments = res.payments.map((p: any) => {

          const sub = subscriptions.find((s: any) => s.suscripcion_id === p.suscripcion_id);
          const plan = plans.find((pl: any) => pl.plan_id === sub?.plan_id);
          const est = establishments.find((e: any) => e.establecimiento_id === sub?.establecimiento_id);

          return {
            ...p,
            plan_nombre: plan ? plan.nombre : 'Sin plan',
            establecimiento_nombre: est ? est.nombre : 'Sin negocio'
          };

        });

        this.filteredPayments = this.payments;

        this.loading = false;
      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      }

    });

  }

  // 🔍 BUSCADOR
  onSearch() {

    const term = this.searchTerm.toLowerCase();

    this.filteredPayments = this.payments.filter(p => {

      const texto = `
        ${p.establecimiento_nombre}
        ${p.plan_nombre}
        ${p.monto}
        ${p.metodo_pago}
        ${p.estado}
      `.toLowerCase();

      return texto.includes(term);

    });

  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  reloadAfterCreate() {
    this.closeCreateModal();
    this.loadAllData();
  }

  editPayment(payment: any) {
    this.selectedId = payment.pago_id || payment.id;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  reloadAfterUpdate() {
    this.closeEditModal();
    this.loadAllData();
  }

  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  reloadAfterDelete() {
    this.closeDeleteModal();
    this.loadAllData();
  }

}