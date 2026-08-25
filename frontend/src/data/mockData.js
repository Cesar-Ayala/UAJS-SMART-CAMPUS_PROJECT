export const mockServices = [
  { id: 'solicitudes', nombre: 'Solicitudes', categoria: 'Trámites', descripcion: 'Registra y consulta el estado de tus solicitudes universitarias.' },
  { id: 'reservas', nombre: 'Reservas', categoria: 'Recursos', descripcion: 'Reserva salas, laboratorios y equipos disponibles.' },
  { id: 'recursos', nombre: 'Recursos', categoria: 'Recursos', descripcion: 'Consulta los recursos institucionales disponibles.' },
  { id: 'eventos', nombre: 'Eventos', categoria: 'Comunidad', descripcion: 'Conferencias, seminarios y actividades institucionales.' },
  { id: 'notificaciones', nombre: 'Notificaciones', categoria: 'Comunicación', descripcion: 'Alertas y comunicaciones generadas por la plataforma.' },
  { id: 'pqrs', nombre: 'PQRS', categoria: 'Trámites', descripcion: 'Peticiones, quejas, reclamos y sugerencias.' }
]

export const mockRequests = [
  { id: 'SOL-001', tipo: 'Certificado académico', dependencia: 'Registro Académico', fecha: '2026-08-10', estado: 'En proceso', descripcion: 'Solicitud de certificado de notas para práctica profesional.' },
  { id: 'SOL-002', tipo: 'Préstamo de equipo', dependencia: 'Laboratorios', fecha: '2026-08-15', estado: 'Registrada', descripcion: 'Préstamo de portátil para proyecto de aula.' },
  { id: 'SOL-003', tipo: 'PQRS', dependencia: 'Bienestar Universitario', fecha: '2026-08-18', estado: 'Resuelta', descripcion: 'Sugerencia sobre horarios de cafetería.' }
]

export const requestStatusFlow = ['Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada']

export const mockReservations = [
  { id: 'RES-001', recurso: 'Laboratorio de Redes', fecha: '2026-08-25', hora: '10:00 AM', estado: 'Confirmada' },
  { id: 'RES-002', recurso: 'Sala de juntas B3', fecha: '2026-08-27', hora: '2:00 PM', estado: 'Pendiente' }
]

export const mockResources = [
  { id: 'REC-001', nombre: 'Laboratorio de Redes', tipo: 'Laboratorio', ubicacion: 'Bloque B - Piso 2', disponible: true },
  { id: 'REC-002', nombre: 'Sala de juntas B3', tipo: 'Sala', ubicacion: 'Bloque B - Piso 3', disponible: true },
  { id: 'REC-003', nombre: 'Videobeam portátil', tipo: 'Equipo', ubicacion: 'Almacén general', disponible: false }
]

export const mockEvents = [
  { id: 'EVT-001', nombre: 'Semana de la Ingeniería', fecha: '2026-09-02', hora: '8:00 AM', lugar: 'Auditorio principal', descripcion: 'Conferencias y talleres de tecnología.' },
  { id: 'EVT-002', nombre: 'Feria de Semilleros de Investigación', fecha: '2026-09-10', hora: '9:00 AM', lugar: 'Plazoleta central', descripcion: 'Presentación de proyectos estudiantiles.' }
]

export const mockNotifications = [
  { id: 'NOT-001', mensaje: 'Tu solicitud SOL-001 cambió de estado a "En proceso".', fecha: '2026-08-20', leida: false },
  { id: 'NOT-002', mensaje: 'Tu reserva RES-001 fue confirmada.', fecha: '2026-08-19', leida: true }
]

export const mockProfile = {
  nombre: 'Ana María Torres',
  tipoUsuario: 'Estudiante',
  programa: 'Ingeniería de Sistemas',
  correo: 'ana.torres@uajs.edu.co'
}
