import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import { requireRole } from '../../../../shared/auth.js'

const router = Router()

// Listar usuarios: personal y admin (y los servicios internos). Crear y eliminar: solo admin.
router.get('/', requireRole('administrativo', 'admin', 'service'), UserController.list)
// Consultar y editar uno: el propio usuario o quien tenga permiso (lo valida el controlador).
router.get('/:id', UserController.getById)
router.put('/:id', UserController.update)
router.post('/', requireRole('admin'), UserController.create)
router.delete('/:id', requireRole('admin'), UserController.remove)

export default router
