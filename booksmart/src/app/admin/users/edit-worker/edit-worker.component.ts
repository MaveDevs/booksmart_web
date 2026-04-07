import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-edit-worker',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './edit-worker.component.html',
  styleUrls: ['./edit-worker.component.css']
})
export class EditWorkerComponent implements OnInit {

  @Input() workerId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  apiUrl = 'http://localhost:8000/api/v1';

  worker: any = {};
  establishments: any[] = [];

  imageFile: File | null = null;
  imagePreview: string | null = null;

  loading = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    this.loadEstablishments();
    this.loadWorker();
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

  loadWorker(){
    this.http.get(`${this.apiUrl}/workers/${this.workerId}`, {
      headers:this.getHeaders()
    }).subscribe({
      next: (data:any) => {
        this.worker = data;

        if(this.worker.fecha_contratacion){
          this.worker.fecha_contratacion = this.worker.fecha_contratacion.split('T')[0];
        }

        this.imagePreview = this.worker.foto_perfil;
      }
    });
  }

  loadEstablishments(){
    this.http.get<any[]>(`${this.apiUrl}/establishments/`, {
      headers:this.getHeaders()
    }).subscribe(data => this.establishments = data);
  }

  onFileSelected(event:any){
    const file = event.target.files[0];
    if(!file) return;

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async uploadImage(file: File): Promise<string> {

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'workers_upload');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/da8ohqavz/image/upload',
      { method: 'POST', body: formData }
    );

    const data = await res.json();
    return data.secure_url;
  }

  async update(){

    if(
      !this.worker.establecimiento_id ||
      !this.worker.nombre ||
      !this.worker.apellido ||
      !this.worker.email ||
      !this.worker.telefono ||
      !this.worker.especialidad ||
      !this.worker.fecha_contratacion
    ){
      alert('Completa todos los campos');
      return;
    }

    this.loading = true;

    try {

      let imageUrl = this.worker.foto_perfil;

      if(this.imageFile){
        imageUrl = await this.uploadImage(this.imageFile);
      }

      const payload = {
        ...this.worker,
        foto_perfil: imageUrl,
        descripcion: this.worker.descripcion || ''
      };

      await this.http.put(
        `${this.apiUrl}/workers/${this.workerId}`,
        payload,
        { headers:this.getHeaders() }
      ).toPromise();

      this.updated.emit();

    } catch (err){
      console.error(err);
      alert('Error al actualizar');
    }

    this.loading = false;
  }

}