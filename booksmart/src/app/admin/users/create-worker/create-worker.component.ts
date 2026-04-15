import { Component, Output, EventEmitter, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-worker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-worker.component.html',
  styleUrls: ['./create-worker.component.css']
})
export class CreateWorkerComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  apiUrl = environment.apiUrl;

  establishments: any[] = [];

  photoFile: File | null = null;
  photoPreview: string | null = null;

  worker: any = {
    establecimiento_id: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    foto_perfil: '',
    especialidad: '',
    descripcion: '',
    activo: true,
    fecha_contratacion: ''
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    this.loadEstablishments();
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

  loadEstablishments(){
    this.http.get(`${this.apiUrl}/establishments/`, { headers:this.getHeaders() })
      .subscribe({
        next:(data:any)=> this.establishments = data,
        error:(err)=> console.error(err)
      });
  }

  onFileSelected(event: any){

    const file = event.target.files[0];
    if(!file) return;

    this.photoFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  async uploadImage(file: File): Promise<string>{

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'workers_upload');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/da8ohqavz/image/upload',
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await res.json();
    return data.secure_url;
  }

  async createWorker(){

    try{

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

      const imageUrl = this.photoFile 
        ? await this.uploadImage(this.photoFile)
        : '';

      this.worker.foto_perfil = imageUrl;

      await this.http.post(
        `${this.apiUrl}/workers/`,
        this.worker,
        { headers:this.getHeaders() }
      ).toPromise();

      this.created.emit();
      this.close.emit();

    }catch(err){
      console.error("ERROR ❌", err);
      alert('Error al crear trabajador');
    }
  }

  closeModal(){
    this.close.emit();
  }

}