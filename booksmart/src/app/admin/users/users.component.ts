import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { DeleteUserComponent } from './delete-user/delete-user.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    CreateUserComponent,
    EditUserComponent,
    DeleteUserComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  apiUrl = 'http://localhost:8000/api/v1';

  users: any[] = [];
  owners: any[] = [];

  loading = false;

  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;

  selectedId!: number;

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

    this.http.get<any[]>(
      `${this.apiUrl}/users/`,
      { headers:this.getHeaders() }
    ).subscribe({

      next:(data)=>{

        this.users = data;

        this.owners = this.users.filter(
          user => user.rol_id === 2
        );

        this.loading = false;

      },

      error:(err)=>{
        console.error("Error cargando usuarios",err);
        this.loading = false;
      }

    });

  }

  openCreateModal(){
    this.showCreateModal = true;
  }

  closeCreateModal(){
    this.showCreateModal = false;
  }

  reloadAfterCreate(){
    this.closeCreateModal();
    this.loadUsers();
  }

  openEditModal(id:number){
    this.selectedId = id;
    this.showEditModal = true;
  }

  closeEditModal(){
    this.showEditModal = false;
  }

  reloadAfterEdit(){
    this.closeEditModal();
    this.loadUsers();
  }

  openDeleteModal(id:number){
    this.selectedId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(){
    this.showDeleteModal = false;
  }

  reloadAfterDelete(){
    this.closeDeleteModal();
    this.loadUsers();
  }

}