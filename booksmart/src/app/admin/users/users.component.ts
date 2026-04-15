import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';

import { CreateClientComponent } from './create-client/create-client.component';
import { EditClientComponent } from './edit-client/edit-client.component';
import { DeleteClientComponent } from './delete-client/delete-client.component';

import { CreateWorkerComponent } from './create-worker/create-worker.component';
import { EditWorkerComponent } from './edit-worker/edit-worker.component';
import { DeleteWorkerComponent } from './delete-worker/delete-worker.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,

    CreateUserComponent,
    EditUserComponent,
    DeleteUserComponent,

    CreateClientComponent,
    EditClientComponent,
    DeleteClientComponent,

    CreateWorkerComponent,
    EditWorkerComponent,
    DeleteWorkerComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  apiUrl = environment.apiUrl;

  users: any[] = [];
  filteredUsers: any[] = [];

  searchText: string = '';

  loading = false;

  view: 'owners' | 'clients' | 'workers' | 'all' = 'owners';

  selectedId!: number;

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  showCreateClientModal = false;
  showEditClientModal = false;
  showDeleteClientModal = false;

  showCreateWorkerModal = false;
  showEditWorkerModal = false;
  showDeleteWorkerModal = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  getHeaders(){
    let token = '';
    if(isPlatformBrowser(this.platformId)){
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json'
    });
  }

  loadUsers(){

    this.loading = true;

    if(this.view === 'workers'){
      this.http.get<any[]>(`${this.apiUrl}/workers/`, {
        headers:this.getHeaders()
      }).subscribe({
        next:(data)=>{
          this.users = data;
          this.filteredUsers = data;
          this.loading = false;
        },
        error:(err)=>{
          console.error(err);
          this.loading = false;
        }
      });
      return;
    }

    this.http.get<any[]>(`${this.apiUrl}/users/`, {
      headers:this.getHeaders()
    }).subscribe({
      next:(data)=>{
        this.users = data;
        this.applyFilter();
        this.loading = false;
      },
      error:(err)=>{
        console.error(err);
        this.loading = false;
      }
    });
  }

  applyFilter(){

    if(this.view === 'owners'){
      this.filteredUsers = this.users.filter(u => u.rol_id === 2);
    }
    else if(this.view === 'clients'){
      this.filteredUsers = this.users.filter(u => u.rol_id === 1);
    }
    else{
      this.filteredUsers = this.users;
    }

  }

  filterUsers(){

    const text = this.searchText.toLowerCase();

    if(!text){
      this.applyFilter();
      return;
    }

    const found = this.users.filter(u =>
      (u.nombre || '').toLowerCase().includes(text) ||
      (u.apellido || '').toLowerCase().includes(text) ||
      (u.correo || '').toLowerCase().includes(text)
    );

    if(found.length > 0){

      const first = found[0];

      if(first.rol_id === 1) this.view = 'clients';
      else if(first.rol_id === 2) this.view = 'owners';
      else if(first.rol_id === 4) this.view = 'workers';
      else this.view = 'all';

      this.applyFilter();

      this.filteredUsers = this.filteredUsers.filter(u =>
        (u.nombre || '').toLowerCase().includes(text) ||
        (u.apellido || '').toLowerCase().includes(text) ||
        (u.correo || '').toLowerCase().includes(text)
      );

    } else {
      this.filteredUsers = [];
    }

  }

  setView(view:'owners'|'clients'|'workers'|'all'){
    this.view = view;
    this.searchText = '';
    this.loadUsers(); 
  }

  openCreate(){
    if(this.view === 'clients'){
      this.showCreateClientModal = true;
    }
    else if(this.view === 'workers'){
      this.showCreateWorkerModal = true;
    }
    else{
      this.showCreateModal = true;
    }
  }

  closeCreate(){
    this.showCreateModal = false;
    this.showCreateClientModal = false;
    this.showCreateWorkerModal = false;
  }

  openEdit(id:number){
    this.selectedId = id;

    if(this.view === 'workers'){
      this.showEditWorkerModal = true;
    }
    else if(this.view === 'clients'){
      this.showEditClientModal = true;
    }
    else{
      this.showEditModal = true;
    }
  }

  closeEdit(){
    this.showEditModal = false;
    this.showEditClientModal = false;
    this.showEditWorkerModal = false;
  }

  openDelete(id:number){
    this.selectedId = id;

    if(this.view === 'workers'){
      this.showDeleteWorkerModal = true;
    }
    else if(this.view === 'clients'){
      this.showDeleteClientModal = true;
    }
    else{
      this.showDeleteModal = true;
    }
  }

  closeDelete(){
    this.showDeleteModal = false;
    this.showDeleteClientModal = false;
    this.showDeleteWorkerModal = false;
  }

  reloadAll(){
    this.closeCreate();
    this.closeEdit();
    this.closeDelete();
    this.loadUsers();
  }

}