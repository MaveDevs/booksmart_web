import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { CreatePlanComponent } from './create-plan/create-plan.component';
import { EditPlanComponent } from './edit-plan/edit-plan.component';
import { DeletePlanComponent } from './delete-plan/delete-plan.component';

import { CreateSubscriptionComponent } from './create-subscription/create-subscription.component';
import { EditSubscriptionComponent } from './edit-subscription/edit-subscription.component';
import { DeleteSubscriptionComponent } from './delete-subscription/delete-subscription.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [
    CommonModule,
    CreatePlanComponent,
    EditPlanComponent,
    DeletePlanComponent,
    CreateSubscriptionComponent,
    EditSubscriptionComponent,
    DeleteSubscriptionComponent
  ],
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css']
})
export class PlansComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  establishments: any[] = [];
  plans: any[] = [];
  subscriptions: any[] = [];

  data: any[] = [];
  loading = true;

  view: 'subscriptions' | 'plans' = 'subscriptions';

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedId!: number;

  showCreateSubModal = false;
  showEditSubModal = false;
  showDeleteSubModal = false;
  selectedSubId!: number;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;

    forkJoin({
      establishments: this.http.get<any[]>(`${this.apiUrl}/establishments/`),
      plans: this.http.get<any[]>(`${this.apiUrl}/plans/`),
      subscriptions: this.http.get<any[]>(`${this.apiUrl}/subscriptions/`) 
    }).subscribe({
      next: (res) => {

        this.establishments = res.establishments;
        this.plans = res.plans;
        this.subscriptions = res.subscriptions;

        this.combineData();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ ERROR LOAD:', err);
        this.loading = false;
      }
    });
  }

  combineData() {

    this.data = this.subscriptions.map(sub => {

      const establishment = this.establishments.find(
        e => e.establecimiento_id === sub.establecimiento_id
      );

      const plan = this.plans.find(
        p => p.plan_id === sub.plan_id
      );

      return {
        subscription_id: Number(sub.suscripcion_id), 

        establecimiento: establishment?.nombre || 'Sin nombre',
        plan: plan?.nombre || 'Sin plan',
        precio: plan?.precio || 0,
        estado: sub.estado,
        fecha_inicio: sub.fecha_inicio,
        fecha_fin: sub.fecha_fin,

        establecimiento_id: sub.establecimiento_id,
        plan_id: sub.plan_id
      };
    });

    console.log(' DATA FINAL:', this.data);
  }

  setView(view: 'subscriptions' | 'plans') {
    this.view = view;
  }

  openCreateModal() { this.showCreateModal = true; }
  closeCreateModal() { this.showCreateModal = false; }

  openEditModal(id: number) {
    this.selectedId = id;
    this.showEditModal = true;
  }

  closeEditModal() { this.showEditModal = false; }

  openDeleteModal(id: number) {
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() { this.showDeleteModal = false; }

  openCreateSubModal() { this.showCreateSubModal = true; }
  closeCreateSubModal() { this.showCreateSubModal = false; }

  openEditSubModal(item: any) {

    if (!item || !item.subscription_id) {
      alert('Error: ID no válido');
      return;
    }

    this.selectedSubId = item.subscription_id;
    this.showEditSubModal = true;
  }

  closeEditSubModal() { this.showEditSubModal = false; }

  openDeleteSubModal(item: any) {
    this.selectedSubId = item.subscription_id;
    this.showDeleteSubModal = true;
  }

  closeDeleteSubModal() { this.showDeleteSubModal = false; }

  reloadData() {
    this.loadData();
  }
}