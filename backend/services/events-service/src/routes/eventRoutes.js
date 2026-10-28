import { Router } from 'express'
import { EventController } from '../controllers/eventController.js'
import { requireRole } from '../../../../shared/auth.js'

const router = Router()
// Consultar: cualquier usuario autenticado. Publicar eventos: docente, administrativo y admin
// (el docente solo puede modificar o eliminar los suyos; eso lo valida el controlador).
const publish = requireRole('docente', 'administrativo', 'admin')

router.get('/', EventController.list)
router.get('/:id', EventController.getById)
router.post('/', publish, EventController.create)
router.put('/:id', publish, EventController.update)
router.delete('/:id', publish, EventController.remove)

export default router
