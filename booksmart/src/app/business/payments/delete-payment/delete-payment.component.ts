import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delete-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-payment.component.html',
  styleUrls: ['./delete-payment.component.css']
})
export class DeletePaymentComponent {

  @Input() paymentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private apiUrl = environment.apiUrl + '/payments';

  constructor(private http: HttpClient) {}

  delete() {
    this.http.delete(`${this.apiUrl}/${this.paymentId}/`)
      .subscribe({
        next: () => this.deleted.emit(),
        error: (err) => console.error(err)
      });
  }

  closeModal() {
    this.close.emit();
  }
}