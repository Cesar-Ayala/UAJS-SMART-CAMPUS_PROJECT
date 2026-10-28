-- ============================================================
-- UAJS Smart Campus - Datos de prueba (FICTICIOS)
-- Ejecutar DESPUÉS de schema.sql y UNA sola vez sobre una base recién creada.
-- Las fechas de las reservas y los eventos son RELATIVAS al día en que se carga este script
-- (hoy + N días), así siempre quedan en el futuro y las reglas de negocio las aceptan.
-- No contiene datos personales reales: nombres, correos y contraseñas son inventados.
--
-- Cuentas de prueba (contraseña = la que aparece a la derecha):
--   estudiante@uajs.edu.co      estudiante123
--   estudiante2@uajs.edu.co     estudiante123
--   docente@uajs.edu.co         docente123
--   administrativo@uajs.edu.co  administrativo123
--   admin@uajs.edu.co           admin123
-- En la base solo se guardan sus hashes bcrypt.
-- ============================================================
-- Fija la codificación de ESTA sesión en UTF-8, sin importar la configuración del
-- cliente mysql: sin esto, los acentos (María, 'En revisión') se guardarían corruptos.
SET NAMES utf8mb4;

USE uajs_smart_campus;

-- ------------------------------------------------------------
-- Roles
-- ------------------------------------------------------------
INSERT INTO roles (codigo, nombre, descripcion) VALUES
  ('estudiante', 'Estudiante', 'Consulta servicios, registra solicitudes y reserva recursos.'),
  ('docente', 'Docente', 'Como estudiante, y además publica eventos y gestiona sus reservas.'),
  ('administrativo', 'Administrativo', 'Gestiona solicitudes, recursos, reservas y eventos.'),
  ('admin', 'Administrador del sistema', 'Acceso total: usuarios, roles y configuración.');

-- ------------------------------------------------------------
-- Servicios
-- ------------------------------------------------------------
INSERT INTO servicios (id, nombre, categoria, descripcion) VALUES
  ('solicitudes', 'Solicitudes', 'Trámites', 'Registra y consulta el estado de tus solicitudes universitarias.'),
  ('reservas', 'Reservas', 'Recursos', 'Reserva salas, laboratorios y equipos disponibles.'),
  ('recursos', 'Recursos', 'Recursos', 'Consulta los recursos institucionales disponibles.'),
  ('eventos', 'Eventos', 'Comunidad', 'Conferencias, seminarios y actividades institucionales.'),
  ('notificaciones', 'Notificaciones', 'Comunicación', 'Alertas y comunicaciones generadas por la plataforma.'),
  ('pqrs', 'PQRS', 'Trámites', 'Peticiones, quejas, reclamos y sugerencias.');

-- ------------------------------------------------------------
-- Usuarios (uno por rol, más un segundo estudiante)
-- ------------------------------------------------------------
INSERT INTO usuarios (nombre, correo, password_hash, rol, programa) VALUES
  ('Ana María Torres', 'estudiante@uajs.edu.co', '$2a$10$BN8V25TcDvKRaSefb1z3Yum.BCC7cfxmXVhlyD9hXZJodPubVzDy.', 'estudiante', 'Ingeniería de Sistemas'),
  ('Luis Herrera', 'estudiante2@uajs.edu.co', '$2a$10$Q9JPhpifeHvKKGzNP31PzOHgxtYF2/OrOp6ispsbBqj0.EqNsm6pq', 'estudiante', 'Administración de Empresas'),
  ('Carlos Pérez Ruiz', 'docente@uajs.edu.co', '$2a$10$L1H8i0MURqQkbdjdRMkyr.CAEsgXLysVadki0tKbMnCNdnuxUH32e', 'docente', 'Facultad de Ingeniería'),
  ('Diana Restrepo', 'administrativo@uajs.edu.co', '$2a$10$O5D9tHNozRyJInHD9DgxyewK5MJ2DlftiilVltNtbbU9h1QrLuITm', 'administrativo', 'Registro Académico'),
  ('Sistema UAJS', 'admin@uajs.edu.co', '$2a$10$C0DevwS18XJcyilf2vwgT.iqlTnehWQfP5XIiBzMAK1XCieaXx1Na', 'admin', 'Tecnología e Informática');

-- ------------------------------------------------------------
-- Recursos
-- ------------------------------------------------------------
INSERT INTO recursos (codigo, nombre, tipo, ubicacion, descripcion, estado, disponible) VALUES
  ('REC-001', 'Laboratorio de Redes', 'Laboratorio', 'Bloque B - Piso 2', 'Laboratorio con 20 equipos y conmutadores para prácticas de redes.', 'Activo', 1),
  ('REC-002', 'Sala de juntas B3', 'Sala', 'Bloque B - Piso 3', 'Sala para reuniones de hasta 12 personas.', 'Activo', 1),
  ('REC-003', 'Videobeam portátil', 'Equipo', 'Almacén general', 'Proyector portátil con cable HDMI.', 'Activo', 0),
  ('REC-004', 'Laboratorio de Sistemas', 'Laboratorio', 'Bloque A - Piso 1', 'Laboratorio con 30 equipos de escritorio.', 'Activo', 1),
  ('REC-005', 'Auditorio Principal', 'Espacio', 'Bloque C - Piso 1', 'Auditorio con capacidad para 200 personas.', 'Activo', 1),
  ('REC-006', 'Portátil de préstamo', 'Equipo', 'Almacén general', 'Portátil para préstamo a estudiantes.', 'Mantenimiento', 0);

-- ------------------------------------------------------------
-- Solicitudes (en distintos estados) y su historial
-- ------------------------------------------------------------
INSERT INTO solicitudes (codigo, usuario_id, tipo, dependencia, fecha, descripcion, prioridad, estado, responsable, solucion) VALUES
  ('SOL-0001', (SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Certificado académico', 'Registro Académico', '2026-10-05 09:15:00', 'Solicitud de certificado de notas para práctica profesional.', 'media', 'En proceso', 'Diana Restrepo', NULL),
  ('SOL-0002', (SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Préstamo de equipo', 'Laboratorios', '2026-10-15 14:30:00', 'Préstamo de portátil para proyecto de aula.', 'media', 'Registrada', NULL, NULL),
  ('SOL-0003', (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'PQRS - Sugerencia', 'Bienestar Universitario', '2026-09-28 10:00:00', 'Sugerencia sobre los horarios de la cafetería.', 'baja', 'Resuelta', 'Diana Restrepo', 'Se amplió el horario de atención de la cafetería hasta las 7:00 PM.'),
  ('SOL-0004', (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), 'Soporte técnico', 'Tecnología e Informática', '2026-10-14 08:45:00', 'El proyector del aula B-204 no enciende.', 'alta', 'Asignada', 'Sistema UAJS', NULL),
  ('SOL-0005', (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'PQRS - Queja', 'Bienestar Universitario', '2026-10-18 16:20:00', 'El aire acondicionado del laboratorio A-101 no funciona.', 'media', 'En revisión', NULL, NULL),
  ('SOL-0006', (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), 'Certificado laboral', 'Talento Humano', '2026-09-20 11:05:00', 'Certificado laboral para trámite bancario.', 'baja', 'Cerrada', 'Diana Restrepo', 'Certificado entregado al solicitante.');

INSERT INTO solicitud_historial (solicitud_id, estado_anterior, estado_nuevo, usuario_id, comentario, fecha) VALUES
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0001'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Solicitud registrada.', '2026-10-05 09:15:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0001'), 'Registrada', 'En revisión', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En revisión.', '2026-10-05 15:15:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0001'), 'En revisión', 'Asignada', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Asignada.', '2026-10-05 21:15:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0001'), 'Asignada', 'En proceso', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En proceso.', '2026-10-06 03:15:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0002'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Solicitud registrada.', '2026-10-15 14:30:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0003'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'Solicitud registrada.', '2026-09-28 10:00:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0003'), 'Registrada', 'En revisión', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En revisión.', '2026-09-28 16:00:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0003'), 'En revisión', 'Asignada', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Asignada.', '2026-09-28 22:00:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0003'), 'Asignada', 'En proceso', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En proceso.', '2026-09-29 04:00:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0003'), 'En proceso', 'Resuelta', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Resuelta.', '2026-09-29 10:00:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0004'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), 'Solicitud registrada.', '2026-10-14 08:45:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0004'), 'Registrada', 'En revisión', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En revisión.', '2026-10-14 14:45:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0004'), 'En revisión', 'Asignada', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Asignada.', '2026-10-14 20:45:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0005'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'Solicitud registrada.', '2026-10-18 16:20:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0005'), 'Registrada', 'En revisión', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En revisión.', '2026-10-18 22:20:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0006'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), 'Solicitud registrada.', '2026-09-20 11:05:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0006'), 'Registrada', 'En revisión', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En revisión.', '2026-09-20 17:05:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0006'), 'En revisión', 'Asignada', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Asignada.', '2026-09-20 23:05:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0006'), 'Asignada', 'En proceso', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a En proceso.', '2026-09-21 05:05:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0006'), 'En proceso', 'Resuelta', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Resuelta.', '2026-09-21 11:05:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0006'), 'Resuelta', 'Cerrada', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'Cambio de estado a Cerrada.', '2026-09-21 17:05:00');

-- ------------------------------------------------------------
-- Reservas
-- La última está cancelada (activa = NULL): comparte franja con la primera
-- y por eso demuestra que una reserva cancelada no bloquea la franja.
-- ------------------------------------------------------------
INSERT INTO reservas (recurso_id, usuario_id, fecha, hora, proposito, estado, activa) VALUES
  ((SELECT id FROM recursos WHERE codigo = 'REC-001'), (SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00 AM', 'Práctica de redes', 'Confirmada', 1),
  ((SELECT id FROM recursos WHERE codigo = 'REC-001'), (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), DATE_ADD(CURDATE(), INTERVAL 2 DAY), '2:00 PM', 'Clase de laboratorio', 'Pendiente', 1),
  ((SELECT id FROM recursos WHERE codigo = 'REC-002'), (SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), DATE_ADD(CURDATE(), INTERVAL 3 DAY), '9:00 AM', 'Reunión de semillero', 'Confirmada', 1),
  ((SELECT id FROM recursos WHERE codigo = 'REC-004'), (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), DATE_ADD(CURDATE(), INTERVAL 7 DAY), '3:00 PM', 'Proyecto de aula', 'Pendiente', 1),
  ((SELECT id FROM recursos WHERE codigo = 'REC-001'), (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00 AM', 'Práctica de redes (cancelada por el usuario)', 'Cancelada', NULL);

-- ------------------------------------------------------------
-- Eventos
-- ------------------------------------------------------------
INSERT INTO eventos (nombre, fecha, hora, hora_fin, lugar, descripcion, estado, creado_por) VALUES
  ('Taller de Escritura Académica', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '2:00 PM', '4:00 PM', 'Sala de juntas B3', 'Taller práctico sobre redacción de textos académicos.', 'Programado', (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co')),
  ('Semana de la Ingeniería', DATE_ADD(CURDATE(), INTERVAL 14 DAY), '8:00 AM', '5:00 PM', 'Auditorio Principal', 'Conferencias y talleres de tecnología.', 'Programado', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co')),
  ('Feria de Semilleros de Investigación', DATE_ADD(CURDATE(), INTERVAL 21 DAY), '9:00 AM', '1:00 PM', 'Plazoleta central', 'Presentación de proyectos estudiantiles.', 'Programado', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co')),
  ('Conferencia de Ciberseguridad', DATE_ADD(CURDATE(), INTERVAL 28 DAY), '10:00 AM', '12:00 PM', 'Auditorio Principal', 'Charla introductoria sobre seguridad informática.', 'Programado', (SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'));

-- ------------------------------------------------------------
-- Notificaciones (algunas leídas y otras sin leer)
-- ------------------------------------------------------------
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id, leida, leida_en, fecha) VALUES
  ((SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Solicitud en proceso', 'Tu solicitud SOL-0001 pasó al estado En proceso.', 'solicitud', 'solicitud', (SELECT id FROM solicitudes WHERE codigo = 'SOL-0001'), 0, NULL, '2026-10-06 03:15:00'),
  ((SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Reserva confirmada', 'Tu reserva del Laboratorio de Redes (10:00 AM) fue confirmada.', 'reserva', 'reserva', (SELECT id FROM reservas WHERE recurso_id = (SELECT id FROM recursos WHERE codigo = 'REC-001') AND fecha = DATE_ADD(CURDATE(), INTERVAL 2 DAY) AND hora = '10:00 AM' AND activa = 1), 1, '2026-10-20 08:00:00', '2026-10-19 17:00:00'),
  ((SELECT id FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'), 'Nuevo evento', 'Se programó la Semana de la Ingeniería. Consulta la fecha en Eventos.', 'evento', 'evento', (SELECT id FROM eventos WHERE nombre = 'Semana de la Ingeniería'), 0, NULL, '2026-10-18 12:00:00'),
  ((SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'Solicitud en revisión', 'Tu solicitud SOL-0005 está siendo revisada.', 'solicitud', 'solicitud', (SELECT id FROM solicitudes WHERE codigo = 'SOL-0005'), 0, NULL, '2026-10-19 10:30:00'),
  ((SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), 'Solicitud asignada', 'Tu solicitud SOL-0004 fue asignada a un responsable.', 'solicitud', 'solicitud', (SELECT id FROM solicitudes WHERE codigo = 'SOL-0004'), 1, '2026-10-15 09:00:00', '2026-10-14 20:45:00'),
  ((SELECT id FROM usuarios WHERE correo = 'docente@uajs.edu.co'), 'Reserva pendiente', 'Tu reserva del Laboratorio de Redes (2:00 PM) está pendiente de confirmación.', 'reserva', 'reserva', (SELECT id FROM reservas WHERE recurso_id = (SELECT id FROM recursos WHERE codigo = 'REC-001') AND fecha = DATE_ADD(CURDATE(), INTERVAL 2 DAY) AND hora = '2:00 PM' AND activa = 1), 0, NULL, '2026-10-19 18:10:00');

-- ------------------------------------------------------------
-- Solicitud denegada (ejemplo del estado final 'Rechazada')
-- ------------------------------------------------------------
INSERT INTO solicitudes (codigo, usuario_id, tipo, dependencia, fecha, descripcion, prioridad, estado, responsable, solucion) VALUES
  ('SOL-0007', (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'Certificado académico', 'Registro Académico', '2026-10-12 09:40:00', 'Certificado de notas de un semestre que aún no he cursado.', 'baja', 'Rechazada', NULL, 'El semestre solicitado aún no ha sido cursado; no es posible certificarlo.');

INSERT INTO solicitud_historial (solicitud_id, estado_anterior, estado_nuevo, usuario_id, comentario, fecha) VALUES
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0007'), NULL, 'Registrada', (SELECT id FROM usuarios WHERE correo = 'estudiante2@uajs.edu.co'), 'Solicitud registrada.', '2026-10-12 09:40:00'),
  ((SELECT id FROM solicitudes WHERE codigo = 'SOL-0007'), 'Registrada', 'Rechazada', (SELECT id FROM usuarios WHERE correo = 'administrativo@uajs.edu.co'), 'El semestre solicitado aún no ha sido cursado; no es posible certificarlo.', '2026-10-12 15:10:00');
