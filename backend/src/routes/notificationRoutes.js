import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController.js'

const router = Router()

router.get('/usuario/:usuarioId', NotificationController.listByUser)
router.patch('/:id/leida', NotificationController.markAsRead)

export default router
