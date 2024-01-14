import { Router } from 'express';
import * as patientController from "./patient.controller.js"
import * as doctorController from '../doctor/doctor.controller.js';
import * as validators from '../doctor/doctor.validation.js';
import * as validatorsP from './patient.validation.js'
import fileUpload, { fileValidation } from '../../utils/multer.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import { endPointsPatient } from './patient.endpoint.js'
import { endPoints } from '../doctor/doctor.endpoint.js';
import { auth } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
const router = Router({ mergeParams: true });

router.get(
  '/getAllDoctor',
  auth(endPoints.getAllDoctors),
  validation(validators.getAllDoctor),
  asyncHandler(doctorController.getAllDoctor),
);

router.put(
  '/updateProfile/:id',
  auth(endPointsPatient.updateUserProfile),
  fileUpload(fileValidation.image).single('image'),
  validation(validatorsP.updateUserProfile),
  asyncHandler(patientController.updateUserProfile),
);


export default router