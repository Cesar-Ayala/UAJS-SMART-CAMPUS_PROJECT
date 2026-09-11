import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController.js'

const router = Router()

router.get('/', NotificationController.list)
router.get('/usuario/:usuarioId', NotificationController.listByUser)
router.post('/', NotificationController.create)
router.patch('/:id/leida', NotificationController.markAsRead)

export default router
