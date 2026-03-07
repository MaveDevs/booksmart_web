import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component';

import { BookAppointmentsComponent } from './clients/book-appointments/book-appointments.component';
import { ProfilesComponent } from './clients/profiles/profiles.component';
import { DirectoryComponent } from './clients/directory/directory.component';

import { ApproveAppointmentsComponent } from './business/approve-appointments/approve-appointments.component';
import { CalendarsComponent } from './business/calendars/calendars.component';
import { TechniciansComponent } from './business/technicians/technicians.component';
import { ServicesComponent } from './business/services/services.component';

import { PlansComponent } from './admin/plans/plans.component';
import { AnalyticsComponent } from './admin/analytics/analytics.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { UsersComponent } from './admin/users/users.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [

      // HOME
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // ========================
      // CLIENTES
      // ========================
      { path: 'book-appointments', component: BookAppointmentsComponent },
      { path: 'clients/profiles', component: ProfilesComponent },
      { path: 'clients/directory', component: DirectoryComponent },

      // ========================
      // NEGOCIO
      // ========================
      { path: 'business/approve-appointments', component: ApproveAppointmentsComponent },
      { path: 'business/calendars', component: CalendarsComponent },
      { path: 'business/technicians', component: TechniciansComponent },

      // NUEVO CRUD SERVICIOS
      { path: 'business/services', component: ServicesComponent },

      // ========================
      // ADMIN
      // ========================
      { path: 'admin/plans', component: PlansComponent },
      { path: 'admin/analytics', component: AnalyticsComponent },
      { path: 'admin/reports', component: ReportsComponent },
      { path: 'admin/users', component: UsersComponent },
    ]
  },

  { path: '**', redirectTo: 'login' }

];