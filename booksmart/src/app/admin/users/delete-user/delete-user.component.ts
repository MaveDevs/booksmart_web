import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css']
})
export class DeleteUserComponent {

  @Input() userId!: number;

  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  showSuccessCard = false;
  loading = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getHeaders() {

    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token') || '';
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

  }

  deleteUser() {

    if (!isPlatformBrowser(this.platformId) || this.loading) return;

    this.loading = true;

    this.http.delete(
      `${this.apiUrl}/users/${this.userId}`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => {

        this.showSuccessCard = true;
        this.deleted.emit();

        setTimeout(() => {
          this.showSuccessCard = false;
          this.close.emit();
        }, 1500);

      },
      error: (err: any) => {
        console.error('Error eliminando usuario:', err);
        this.loading = false;
      }
    });

  }

  closeModal() {
    this.close.emit();
  }

}