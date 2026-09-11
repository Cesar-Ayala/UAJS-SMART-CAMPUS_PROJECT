import { Router } from 'express'
import { EventController } from '../controllers/eventController.js'

const router = Router()

router.get('/', EventController.list)
router.post('/', EventController.create)
router.delete('/:id', EventController.remove)

export default router
