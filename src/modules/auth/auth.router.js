import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './auth.validation.js';
import { asyncHandler } from '../../utils/errorHandling.js';
import fileUpload, { fileValidation } from '../../utils/multer.js';

const router = Router();
router.post(
  '/signup',
  fileUpload(fileValidation.image).single('image'),
  validation(validators.signUp),
  asyncHandler(authController.signUp),
);

router.get('/confirmEmail/:token', asyncHandler(authController.confirmEmail));

router.post(
  '/signin',
  validation(validators.signIn),
  asyncHandler(authController.signIn),
);

router.patch(
  '/sendCode',
  validation(validators.sendCode),
  asyncHandler(authController.sendCode),
);
router.patch(
  '/forgotPassword',
  validation(validators.forgotPassword),
  asyncHandler(authController.forgotPassword),
);

export default router;
