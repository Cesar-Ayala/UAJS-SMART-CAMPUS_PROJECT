-- ============================================================
-- UAJS Smart Campus - Esquema de base de datos (MySQL / MariaDB)
-- Entregable 2: persistencia real
--
-- Solo estructura. Los datos de prueba están en seed.sql.
-- Orden de ejecución: 1) schema.sql  2) seed.sql
-- Para recrear desde cero, ver database/README.md.
-- ============================================================
-- Fija la codificación de ESTA sesión en UTF-8, sin importar la configuración del
-- cliente mysql: sin esto, los acentos (María, 'En revisión') se guardarían corruptos.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS uajs_smart_campus
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE uajs_smart_campus;

-- ------------------------------------------------------------
-- Dominio USUARIOS (users-service): roles y usuarios
-- ------------------------------------------------------------

-- Catálogo de roles. La clave primaria es el código del rol (texto), que es
-- el valor que viaja en el JWT y en las verificaciones de permisos.
CREATE TABLE IF NOT EXISTS roles (
  codigo VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,          -- hash bcrypt, nunca texto plano
  rol VARCHAR(20) NOT NULL DEFAULT 'estudiante',
  programa VARCHAR(150),
  activo BOOLEAN NOT NULL DEFAULT TRUE,         -- desactivar en lugar de borrar
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol) REFERENCES roles(codigo)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Catálogo de servicios universitarios (lo consume el frontend)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100),
  descripcion TEXT
);

-- ------------------------------------------------------------
-- Dominio RECURSOS (resources-service)
-- estado: ciclo de vida del recurso. Solo un recurso 'Activo' se puede reservar.
-- disponible: disponibilidad operativa del momento (por ejemplo, prestado).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('Laboratorio', 'Sala', 'Equipo', 'Espacio') NOT NULL,
  ubicacion VARCHAR(150),
  descripcion TEXT,
  estado ENUM('Activo', 'Mantenimiento', 'Inactivo') NOT NULL DEFAULT 'Activo',
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Dominio SOLICITUDES (requests-service)
-- 'Rechazada' es un estado final: la solicitud fue denegada (el motivo queda en 'solucion').
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE,                    -- p. ej. SOL-0001; lo asigna el backend al crear
  usuario_id INT,
  tipo VARCHAR(150) NOT NULL,
  dependencia VARCHAR(150),
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT NOT NULL,
  prioridad ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  estado ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada')
    NOT NULL DEFAULT 'Registrada',
  responsable VARCHAR(150),
  solucion TEXT,                                -- se registra al pasar a 'Resuelta'
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_solicitudes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- Historial de cambios de estado de cada solicitud.
CREATE TABLE IF NOT EXISTS solicitud_historial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitud_id INT NOT NULL,
  estado_anterior ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada'),
  estado_nuevo ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada')
    NOT NULL,
  usuario_id INT,                               -- quién hizo el cambio
  comentario VARCHAR(255),
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Dominio RESERVAS (reservations-service)
-- Cada reserva ocupa una franja de una hora (fecha + hora de inicio).
-- 'activa' vale 1 mientras la reserva no esté cancelada y NULL al cancelarla.
-- La restricción UNIQUE hace que la base de datos rechace dos reservas activas
-- del mismo recurso en la misma franja (en MySQL, NULL no choca con NULL, así
-- que las canceladas no bloquean la franja).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recurso_id INT NOT NULL,
  usuario_id INT,
  fecha DATE NOT NULL,
  hora VARCHAR(20) NOT NULL,
  proposito VARCHAR(255),
  estado ENUM('Pendiente', 'Confirmada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
  activa TINYINT(1) NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reserva_franja (recurso_id, fecha, hora, activa),
  CONSTRAINT fk_reservas_recurso FOREIGN KEY (recurso_id) REFERENCES recursos(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_reservas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Dominio EVENTOS (events-service)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(20),                             -- hora de inicio, p. ej. '8:00 AM'
  hora_fin VARCHAR(20),
  lugar VARCHAR(150),
  descripcion TEXT,
  estado ENUM('Programado', 'Cancelado', 'Finalizado') NOT NULL DEFAULT 'Programado',
  creado_por INT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_eventos_creador FOREIGN KEY (creado_por) REFERENCES usuarios(id)
    ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Dominio NOTIFICACIONES (notifications-service)
-- entidad / entidad_id: registro del sistema que originó el aviso
-- (por ejemplo entidad='solicitud', entidad_id=12). Sin FK: puede apuntar
-- a tablas de otro servicio.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL DEFAULT 'Notificación',
  mensaje VARCHAR(255) NOT NULL,
  tipo ENUM('solicitud', 'reserva', 'evento', 'sistema') NOT NULL DEFAULT 'sistema',
  entidad VARCHAR(30),
  entidad_id INT,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  leida_en DATETIME,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);
