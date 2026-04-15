import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ratings',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {

  apiUrl = environment.apiUrl;

  @Input() establecimientoId: number | null = null;
  @Output() close = new EventEmitter<void>();

  ratingValue = 5;
  ratingComment = '';

  existingReview: any = null;


  showDeleteConfirm = false;
  showSuccess = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMyReview();
  }

  getHeaders() {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadMyReview() {
    this.http.get<any[]>(`${this.apiUrl}/ratings/`, {
      headers: this.getHeaders()
    }).subscribe(res => {

      const myReview = res.find(r =>
        r.establecimiento_id === this.establecimientoId &&
        r.usuario_id === 1
      );

      if (myReview) {
        this.existingReview = myReview;
        this.ratingValue = myReview.calificacion;
        this.ratingComment = myReview.comentario;
      }

    });
  }

  enviarResena() {

    if (this.establecimientoId === null) return;
    if (!this.ratingComment.trim()) return;

    const body = {
      establecimiento_id: this.establecimientoId,
      usuario_id: 1,
      calificacion: this.ratingValue,
      comentario: this.ratingComment
    };

    if (this.existingReview) {

      this.http.put(`${this.apiUrl}/ratings/${this.existingReview.resena_id}`, body, {
        headers: this.getHeaders()
      }).subscribe(() => this.close.emit());

    } else {

      this.http.post(`${this.apiUrl}/ratings/`, body, {
        headers: this.getHeaders()
      }).subscribe(() => this.close.emit());

    }
  }


  openDeleteConfirm() {
    this.showDeleteConfirm = true;
  }


  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  eliminarResena() {

    if (!this.existingReview) return;

    this.http.delete(`${this.apiUrl}/ratings/${this.existingReview.resena_id}`, {
      headers: this.getHeaders()
    }).subscribe(() => {

      this.showDeleteConfirm = false;
      this.showSuccess = true;

      setTimeout(() => {
        this.close.emit();
      }, 1200);

    });

  }

}