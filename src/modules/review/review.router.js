import { Router } from 'express';
import * as reviewController from './review.cotroller.js'
import { asyncHandler } from '../../utils/errorHandling.js';
import { auth } from '../../middleware/auth.js';
import { endPoints } from './review.endpoint.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './review.validation.js';

const router = Router();

router.post(
  '/createReview/:doctorId',
  auth(endPoints.createReview),
  validation(validators.createReview),
  asyncHandler(reviewController.createReview),
);

router.put(
  '/updateReview/:idReview',
  auth(endPoints.updateReview),
  validation(validators.updateReview),
  asyncHandler(reviewController.updateReview),
);
router.delete(
  '/deleteReview/:idReview',
  auth(endPoints.deleteReview),
  validation(validators.deleteReview),
  asyncHandler(reviewController.deleteReview),
);
router.get(
  '/',
  auth(endPoints.getReviews),
  asyncHandler(reviewController.getReviews),
);
router.get(
  '/:doctorId',
  auth(endPoints.getRevSpecificDoc),
  validation(validators.getRevSpecificDoc),
  asyncHandler(reviewController.getRevSpecificDoc),
);

export default router