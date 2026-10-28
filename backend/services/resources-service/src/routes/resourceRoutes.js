import { Router } from 'express'
import { ResourceController } from '../controllers/resourceController.js'
import { requireRole } from '../../../../shared/auth.js'

const router = Router()
// Consultar: cualquier usuario autenticado. Administrar recursos: administrativo y admin.
const manage = requireRole('administrativo', 'admin')

router.get('/', ResourceController.list)
router.get('/:id', ResourceController.getById)
router.post('/', manage, ResourceController.create)
router.put('/:id', manage, ResourceController.update)
router.patch('/:id/disponibilidad', manage, ResourceController.updateAvailability)
router.delete('/:id', manage, ResourceController.remove)

export default router
