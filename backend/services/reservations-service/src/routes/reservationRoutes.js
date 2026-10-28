import { Router } from 'express'
import { ReservationController } from '../controllers/reservationController.js'
import { requireRole } from '../../../../shared/auth.js'

const router = Router()

// Cada usuario ve y gestiona SUS reservas (lo valida el controlador); el personal ve todas.
router.get('/', ReservationController.list)
router.get('/:id', ReservationController.getById)
router.post('/', ReservationController.create)
router.put('/:id', ReservationController.update)
// Cancelar la propia reserva es lo normal; confirmar es del personal (lo valida el controlador).
router.patch('/:id/estado', ReservationController.updateStatus)

// Eliminar el registro: solo admin (lo habitual es cancelar).
router.delete('/:id', requireRole('admin'), ReservationController.remove)

export default router
