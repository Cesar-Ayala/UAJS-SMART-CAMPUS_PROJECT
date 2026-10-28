import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController.js'
import { requireRole } from '../../../../shared/auth.js'

const router = Router()

// Cada usuario ve y marca SUS notificaciones (lo valida el controlador).
router.get('/', NotificationController.list)
// Esta ruta va antes de '/:id' para que 'usuario' no se interprete como un id.
router.get('/usuario/:usuarioId', NotificationController.listByUser)
router.get('/:id', NotificationController.getById)
router.patch('/:id/leida', NotificationController.markAsRead)

// Crear: personal administrativo, admin y los propios servicios. Editar y borrar: solo admin.
router.post('/', requireRole('administrativo', 'admin', 'service'), NotificationController.create)
router.put('/:id', requireRole('admin'), NotificationController.update)
router.delete('/:id', requireRole('admin'), NotificationController.remove)

export default router
