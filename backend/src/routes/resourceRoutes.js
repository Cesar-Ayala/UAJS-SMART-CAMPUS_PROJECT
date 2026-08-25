import { Router } from 'express'
import { ResourceController } from '../controllers/resourceController.js'

const router = Router()

router.get('/', ResourceController.list)
router.patch('/:id/disponibilidad', ResourceController.updateAvailability)

export default router
