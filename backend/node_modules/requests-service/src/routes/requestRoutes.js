import { Router } from 'express'
import { RequestController } from '../controllers/requestController.js'

const router = Router()

router.get('/', RequestController.list)
router.get('/:id', RequestController.getById)
router.post('/', RequestController.create)
router.patch('/:id/estado', RequestController.updateStatus)
router.delete('/:id', RequestController.remove)

export default router
