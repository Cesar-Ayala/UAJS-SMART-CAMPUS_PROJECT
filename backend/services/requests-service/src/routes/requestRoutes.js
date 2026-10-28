import { Router } from 'express'
import { RequestController } from '../controllers/requestController.js'
import { requireRole } from '../../../../shared/auth.js'

const router = Router()

// Cada usuario ve y gestiona SUS solicitudes (lo valida el controlador); el personal ve todas.
router.get('/', RequestController.list)
router.get('/:id', RequestController.getById)
router.get('/:id/historial', RequestController.history)
router.post('/', RequestController.create)
router.put('/:id', RequestController.update)

// Cambiar el estado: personal administrativo y admin. Eliminar: solo admin.
router.patch('/:id/estado', requireRole('administrativo', 'admin'), RequestController.updateStatus)
router.delete('/:id', requireRole('admin'), RequestController.remove)

export default router
