import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnChanges {

  @Input() userId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  user: any = {};

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['userId'] && this.userId) {
      this.loadUser();
    }

  }

  getHeaders() {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  loadUser() {

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get(
      `${this.apiUrl}/users/${this.userId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (data: any) => {
        this.user = data;
      },
      error: (err) => {
        console.error('Error cargando usuario:', err);
      }
    });

  }

  updateUser() {

    this.http.put(
      `${this.apiUrl}/users/${this.userId}`,
      this.user,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {
        alert("Usuario actualizado");
        this.updated.emit();
      },
      error: (err) => {
        console.error('Error actualizando usuario:', err);
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}