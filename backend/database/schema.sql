-- ============================================================
-- UAJS Smart Campus - Esquema de base de datos (MySQL)
-- ============================================================
CREATE DATABASE IF NOT EXISTS uajs_smart_campus
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE uajs_smart_campus;

-- Usuarios y roles
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('estudiante', 'docente', 'administrativo', 'admin') NOT NULL DEFAULT 'estudiante',
  programa VARCHAR(150),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Servicios universitarios articulados por la plataforma
CREATE TABLE IF NOT EXISTS servicios (
  id VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(100),
  descripcion TEXT
);

-- Recursos reservables (salas, laboratorios, equipos)
CREATE TABLE IF NOT EXISTS recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(100),
  ubicacion VARCHAR(150),
  estado VARCHAR(50) DEFAULT 'Activo',
  disponible BOOLEAN DEFAULT TRUE
);

-- Solicitudes universitarias
CREATE TABLE IF NOT EXISTS solicitudes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  tipo VARCHAR(150) NOT NULL,
  dependencia VARCHAR(150),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  descripcion TEXT,
  prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
  estado ENUM('Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada')
    DEFAULT 'Registrada',
  responsable VARCHAR(150),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Reservas de recursos
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recurso_id INT NOT NULL,
  usuario_id INT,
  fecha DATE NOT NULL,
  hora VARCHAR(20) NOT NULL,
  estado ENUM('Pendiente', 'Confirmada', 'Cancelada') DEFAULT 'Pendiente',
  FOREIGN KEY (recurso_id) REFERENCES recursos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Eventos y actividades institucionales
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  fecha DATE NOT NULL,
  hora VARCHAR(20),
  lugar VARCHAR(150),
  descripcion TEXT
);

-- Notificaciones generadas por la plataforma
CREATE TABLE IF NOT EXISTS notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mensaje VARCHAR(255) NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- Datos de prueba (ficticios, sin datos personales reales)
-- ============================================================
INSERT INTO servicios (id, nombre, categoria, descripcion) VALUES
  ('solicitudes', 'Solicitudes', 'Trámites', 'Registra y consulta el estado de tus solicitudes universitarias.'),
  ('reservas', 'Reservas', 'Recursos', 'Reserva salas, laboratorios y equipos disponibles.'),
  ('recursos', 'Recursos', 'Recursos', 'Consulta los recursos institucionales disponibles.'),
  ('eventos', 'Eventos', 'Comunidad', 'Conferencias, seminarios y actividades institucionales.'),
  ('notificaciones', 'Notificaciones', 'Comunicación', 'Alertas y comunicaciones generadas por la plataforma.'),
  ('pqrs', 'PQRS', 'Trámites', 'Peticiones, quejas, reclamos y sugerencias.')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO recursos (codigo, nombre, tipo, ubicacion, disponible) VALUES
  ('REC-001', 'Laboratorio de Redes', 'Laboratorio', 'Bloque B - Piso 2', TRUE),
  ('REC-002', 'Sala de juntas B3', 'Sala', 'Bloque B - Piso 3', TRUE),
  ('REC-003', 'Videobeam portátil', 'Equipo', 'Almacén general', FALSE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Usuarios de prueba (uno por cada rol) para el login.
-- Contraseñas en texto plano (SOLO para pruebas):
--   estudiante@uajs.edu.co / estudiante123
--   docente@uajs.edu.co    / docente123
--   admin@uajs.edu.co      / admin123
INSERT INTO usuarios (nombre, correo, password_hash, rol, programa) VALUES
  ('Ana María Torres', 'estudiante@uajs.edu.co', '2e63a1090735f47213fea3b974418e3e42437325f313b3d3d2f6238cc22298f9', 'estudiante', 'Ingeniería de Sistemas'),
  ('Carlos Pérez Ruiz', 'docente@uajs.edu.co', '9228105f4ea40ae4b70fde55ee2caf4495c1f188333c41ef566417ab04819f56', 'docente', 'Facultad de Ingeniería'),
  ('Sistema UAJS', 'admin@uajs.edu.co', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Tecnología e Informática')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
