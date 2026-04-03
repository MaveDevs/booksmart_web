import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';

import { CreateClientComponent } from './create-client/create-client.component';
import { EditClientComponent } from './edit-client/edit-client.component';
import { DeleteClientComponent } from './delete-client/delete-client.component';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,

    CreateUserComponent,
    EditUserComponent,
    DeleteUserComponent,

    CreateClientComponent,
    EditClientComponent,
    DeleteClientComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  users: any[] = [];
  filteredUsers: any[] = [];

  loading = false;

  view: 'owners' | 'clients' | 'all' = 'owners';

  selectedId!: number;

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  showCreateClientModal = false;
  showEditClientModal = false;
  showDeleteClientModal = false;

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
      this.filteredUsers = this.users.filter(u => u.rol_id === 3);
    }
    else{
      this.filteredUsers = this.users;
    }

  }

  setView(view:'owners'|'clients'|'all'){
    this.view = view;
    this.applyFilter();
  }

  openCreate(){
    if(this.view === 'clients'){
      this.showCreateClientModal = true;
    }else{
      this.showCreateModal = true;
    }
  }

  closeCreate(){
    this.showCreateModal = false;
    this.showCreateClientModal = false;
  }

  openEdit(id:number){
    this.selectedId = id;

    if(this.view === 'clients'){
      this.showEditClientModal = true;
    }else{
      this.showEditModal = true;
    }
  }

  closeEdit(){
    this.showEditModal = false;
    this.showEditClientModal = false;
  }

  openDelete(id:number){
    this.selectedId = id;

    if(this.view === 'clients'){
      this.showDeleteClientModal = true;
    }else{
      this.showDeleteModal = true;
    }
  }

  closeDelete(){
    this.showDeleteModal = false;
    this.showDeleteClientModal = false;
  }

  reloadAll(){
    this.closeCreate();
    this.closeEdit();
    this.closeDelete();
    this.loadUsers();
  }

}