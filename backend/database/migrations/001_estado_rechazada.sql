-- ============================================================
-- Migración 001: agrega el estado 'Rechazada' a las solicitudes.
--
-- Úsala si ya tienes la base creada y NO quieres borrarla. Es seguro ejecutarla más de una vez.
-- Desde backend/ (en PowerShell, con "source", ver database/README.md):
--   mysql -u root < database/migrations/001_estado_rechazada.sql
-- Si estás creando la base desde cero, NO la necesitas: schema.sql ya incluye este cambio.
-- ============================================================
SET NAMES utf8mb4;
USE uajs_smart_campus;

ALTER TABLE solicitudes
  MODIFY estado ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada') NOT NULL DEFAULT 'Registrada';

ALTER TABLE solicitud_historial
  MODIFY estado_anterior ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada') NULL,
  MODIFY estado_nuevo ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada') NOT NULL;
