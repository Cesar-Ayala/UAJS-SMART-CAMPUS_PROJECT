# UAJS Smart Campus

Plataforma distribuida para la gestión y articulación de servicios universitarios
de la Corporación Universitaria Antonio José de Sucre (UAJS).

Este repositorio contiene:

- **frontend/** — Aplicación React (Vite) con React Router, hooks (incluye un custom hook)
  y estilos CSS bajo metodología BEM. Cubre las vistas exigidas en la actividad de aula.
- **backend/** — API REST en Node.js + Express bajo el patrón MVC, lista para conectarse
  a MySQL. Expone endpoints para usuarios, solicitudes, reservas, recursos, eventos y
  notificaciones.

## Arquitectura

```
React (frontend) → API REST (Axios/Fetch) → Express/MVC (backend) → MySQL
```

En una fase posterior, cada carpeta de `backend/src/{controllers,models,routes}` puede
convertirse en un microservicio independiente (Usuarios, Solicitudes, Reservas, Recursos,
Eventos, Notificaciones), tal como propone el documento del proyecto integrador.

## Cómo arrancar en local

### 1. Base de datos
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # y edita tus credenciales de MySQL
npm install
npm run dev             # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

El frontend consulta la API en `frontend/src/api/client.js` (variable `VITE_API_URL`,
por defecto `http://localhost:4000/api`).

## Próximos pasos sugeridos

1. Conectar cada modelo del backend a las tablas reales de `schema.sql`.
2. Implementar JWT en `middlewares/auth.js` (ya viene el esqueleto).
3. Sustituir `frontend/src/data/mockData.js` por llamadas reales una vez el backend
   esté desplegado.
4. Desplegar frontend en Vercel y backend en Railway/Render.
5. (Fase 2 - Sistemas Distribuidos) separar cada dominio en un microservicio propio
   detrás de un API Gateway.
