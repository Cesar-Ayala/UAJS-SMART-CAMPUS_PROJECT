import { Router } from 'express'
import { ServiceController } from '../controllers/serviceController.js'

const router = Router()

router.get('/', ServiceController.list)
router.get('/:id', ServiceController.getById)

export default router
