import { Router } from 'express'
import { UserController } from '../controllers/userController.js'

const router = Router()

router.get('/', UserController.list)
router.get('/:id', UserController.getById)
router.put('/:id', UserController.update)
router.delete('/:id', UserController.remove)

export default router
