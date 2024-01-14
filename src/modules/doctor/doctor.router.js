import { Router } from 'express';
import * as doctorController from './doctor.controller.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './doctor.validation.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { auth } from '../../middleware/auth.js';
import { endPoints } from './doctor.endpoint.js';
import fileUpload,{fileValidation} from '../../utils/multer.js';
import appointmentRouter from './../appointment/appointment.router.js'

const router = Router();
router.use('/:id/appointment',appointmentRouter);


router.get(
  '/getAllDoctor',
  auth(endPoints.getAllDoctors),
  validation(validators.getAllDoctor),
  asyncHandler(doctorController.getAllDoctor),
);
router.get(
  '/getScheduleDoctor/:id',
  auth(endPoints.getScheduleDoctor),
  validation(validators.getScheduleDoctor),
  asyncHandler(doctorController.getScheduleDoctor),
);
router.post(
  '/createSchedule/:id',
  auth(endPoints.createSchedule),
  validation(validators.createSchedule),
  asyncHandler(doctorController.createSchedule),
);
router.put(
  '/updateSchedule/:id',
  auth(endPoints.updateSchedule),
  validation(validators.updateSchedule),
  asyncHandler(doctorController.updateSchedule),
);
router.put(
  '/updateProfile/:id',
  auth(endPoints.updateDoctorProfile),
  fileUpload(fileValidation.image).single('image'),
  validation(validators.updateDoctorProfile), 
  asyncHandler(doctorController.updateDoctorProfile)
);
router.delete(
  '/deleteDay/:id',
  auth(endPoints.deleteDay),
  validation(validators.deleteDay),
  asyncHandler(doctorController.deleteDay),
);
router.delete(
  '/deleteAllSchedule/:id',
  auth(endPoints.deleteAllSchedule),
  validation(validators.deleteAllSchedule),
  asyncHandler(doctorController.deleteAllSchedule),
);
export default router;
