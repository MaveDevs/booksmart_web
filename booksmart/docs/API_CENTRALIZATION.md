# API Centralization Documentation

## Overview
Este documento describe la centralización de las rutas de API en el proyecto Booksmart.

## Cambios Realizados

### 1. **ApiConfigService** (`api-config.service.ts`)
Servicio centralizado que define todas las rutas de API en un único lugar.

```typescript
// Ejemplo de uso:
apiConfig.appointments.list          // http://localhost:8000/api/v1/appointments/
apiConfig.users.getById(1)           // http://localhost:8000/api/v1/users/1
apiConfig.services.create            // http://localhost:8000/api/v1/services/
```

**Ventajas:**
- Cambio de URLs en un único lugar
- Fácil migración a diferentes entornos
- Documentación centralizada de todos los endpoints

---

### 2. **ApiClientService** (`api-client.service.ts`)
Clase base que proporciona métodos comunes para todas las operaciones HTTP:
- `get<T>(url)` - GET requests
- `post<T>(url, data)` - POST requests
- `put<T>(url, data)` - PUT requests
- `delete<T>(url)` - DELETE requests

Maneja automáticamente:
- Headers de autenticación
- Token JWT del localStorage
- Gestión de plataforma (SSR compatibility)

---

### 3. **Servicios de Dominio Específicos**

Cada dominio tiene su propio servicio que extiende `ApiClientService`:

#### AppointmentsService
```typescript
getAppointments(): Observable<any[]>
getAppointmentById(id: number): Observable<any>
createAppointment(data: any): Observable<any>
updateAppointment(id: number, data: any): Observable<any>
deleteAppointment(id: number): Observable<any>
```

#### BusinessServicesService
```typescript
getServices(): Observable<any[]>
getServiceById(id: number): Observable<any>
createService(data: any): Observable<any>
updateService(id: number, data: any): Observable<any>
deleteService(id: number): Observable<any>
```

#### UsersService
```typescript
getUsers(): Observable<any[]>
getUserById(id: number): Observable<any>
createUser(data: any): Observable<any>
updateUser(id: number, data: any): Observable<any>
deleteUser(id: number): Observable<any>
```

#### EstablishmentsService
```typescript
getEstablishments(): Observable<any[]>
getEstablishmentById(id: number): Observable<any>
createEstablishment(data: any): Observable<any>
updateEstablishment(id: number, data: any): Observable<any>
deleteEstablishment(id: number): Observable<any>
```

#### AnalyticsService
```typescript
getSystemOverview(): Observable<any>
```

#### PlansService, SubscriptionsService, ReportsService, AgendasService
Servicios adicionales con la misma estructura CRUD.

---

### 4. **Componentes Actualizados**

Los siguientes componentes fueron refactos para usar los servicios centralizados:

#### Appointments (Citas)
- ✅ `book-appointments.component.ts`
- ✅ `create-appointment/create-appointment.component.ts`
- ✅ `edit-appointment/edit-appointment.component.ts`
- ✅ `delete-appointment/delete-appointment.component.ts`

#### Business Services (Servicios del Negocio)
- ✅ `services.component.ts`
- ✅ `create-service/create-service.component.ts`
- ✅ `edit-service/edit-service.component.ts`
- ✅ `delete-service/delete-service.component.ts`

#### Dashboard
- ✅ `home.component.ts`

---

## Beneficios de esta Estructura

### 1. **Mantenibilidad**
- Todas las URLs en un único lugar (`ApiConfigService`)
- Cambios globales sin tocar componentes

### 2. **Reutilización**
- Servicios compartidos entre componentes
- Lógica de autenticación centralizada

### 3. **Escalabilidad**
- Fácil agregar nuevos endpoints
- Patrón consistente para todos los dominios

### 4. **Testing**
- Servicios fáciles de mockear en tests
- Separación clara de responsabilidades

### 5. **Type Safety**
- Services tipados con Observables genéricos
- Mejor autocompletar en el IDE

---

## Ejemplo de Uso en Componentes

### Antes (Sin Centralización)
```typescript
private apiUrl = 'http://localhost:8000/api/v1';

constructor(private http: HttpClient) {}

getHeaders() {
  return new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json'
  });
}

loadAppointments() {
  this.http.get(`${this.apiUrl}/appointments/`, { 
    headers: this.getHeaders() 
  }).subscribe(data => this.appointments = data);
}
```

### Después (Con Centralización)
```typescript
constructor(private appointmentsService: AppointmentsService) {}

loadAppointments() {
  this.appointmentsService.getAppointments()
    .subscribe(data => this.appointments = data);
}
```

---

## Próximos Pasos Opcionales

1. **Completar actualización de componentes admin**
   - Componentes de usuarios (`admin/users/*`)
   - Componentes de planes (`admin/plans/*`)
   - Componentes de reportes (`admin/reports/*`)
   - Componentes de agendas (`admin/agendas/*`)

2. **Agregar Interceptor Global**
   - Crear `HttpInterceptor` para manejo de errores
   - Agregar reintentos automáticos

3. **Implementar Caché**
   - Agregar caching en los servicios
   - Evitar solicitudes innecesarias

4. **Mejorar Error Handling**
   - Servicio centralizado para manejo de errores
   - Notificaciones globales

5. **Configuración por Entorno**
   - Usar `environment.ts` para dev/prod
   - Configuración dinámica de endpoints

---

## Estructura de Carpetas

```
src/app/services/
├── api-config.service.ts          (URLs centralizadas)
├── api-client.service.ts          (Base HTTP client)
├── auth.service.ts                (Autenticación)
├── appointments.service.ts        (Citas)
├── business-services.service.ts   (Servicios del negocio)
├── users.service.ts               (Usuarios)
├── establishments.service.ts      (Establecimientos)
├── analytics.service.ts           (Analytics)
├── plans.service.ts               (Planes)
├── subscriptions.service.ts       (Suscripciones)
├── reports.service.ts             (Reportes)
└── agendas.service.ts             (Agendas)
```

---

## Notas Importantes

1. **PLATFORM_ID Injection**: Todos los servicios manejan SSR (Server-Side Rendering) correctamente
2. **Authentication**: El token se obtiene automáticamente del localStorage
3. **Tipado**: Los servicios usan genéricos Observable<T> para mejor type safety
4. **Independencia**: Cada dominio tiene su servicio independiente pero cohesivo

---

## Contacto para Dudas

Para preguntas sobre la estructura de APIs, consulta la clase `ApiConfigService` donde está documentado cada endpoint.
