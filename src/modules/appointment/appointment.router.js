import { Router } from 'express';
import * as appointmentController from './appointment.controller.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './appointment.validation.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { auth } from '../../middleware/auth.js';
import { endPoints } from './appointment.endpoint.js';

const router = Router({ mergeParams: true });

router.post(
  '/createAppointment',
  auth(endPoints.createAppointment),
  validation(validators.createAppointment),
  asyncHandler(appointmentController.createAppointment),
);
router.get(
  '/',
  auth(endPoints.getAppointment),
  validation(validators.getAppointmentForDoctor),
  asyncHandler(appointmentController.getAppointmentForDoctor),
);
router.put(
  '/updateAppointment/:idAppointment',
  auth(endPoints.updateAppointment),
  validation(validators.updateAppointment),
  asyncHandler(appointmentController.updateAppointment),
);
router.get(
  '/getAllAppointment',
  auth(endPoints.getAllAppointment),
  asyncHandler(appointmentController.getAllAppointment),
);
router.delete(
  '/deleteAppointment/:idAppointment',
  auth(endPoints.deleteAppointment),
  validation(validators.deleteAppointment),
  asyncHandler(appointmentController.deleteAppointment),
);



export default router;
