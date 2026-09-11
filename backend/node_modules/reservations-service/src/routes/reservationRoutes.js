import { Router } from 'express'
import { ReservationController } from '../controllers/reservationController.js'

const router = Router()

router.get('/', ReservationController.list)
router.post('/', ReservationController.create)
router.patch('/:id/estado', ReservationController.updateStatus)
router.delete('/:id', ReservationController.remove)

export default router
