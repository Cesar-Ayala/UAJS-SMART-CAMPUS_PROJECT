import { Router } from 'express'
import { ResourceController } from '../controllers/resourceController.js'

const router = Router()

router.get('/', ResourceController.list)
router.post('/', ResourceController.create)
router.patch('/:id/disponibilidad', ResourceController.updateAvailability)
router.delete('/:id', ResourceController.remove)

export default router
