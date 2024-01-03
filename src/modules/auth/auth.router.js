import { Router } from 'express';
import * as authController from './auth.controller.js';
import { asyncHandler } from '../../utils/errorHandling.js';

const router = Router();
router.get('/signup', asyncHandler(authController.signup));
export default router;
