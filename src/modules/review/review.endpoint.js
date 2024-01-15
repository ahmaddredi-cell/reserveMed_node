import { roles } from '../../middleware/auth.js';

export const endPoints = {
  createReview: [roles.User],
  updateReview: [roles.User],
  deleteReview: [roles.User],
  getReviews: [roles.User, roles.Doctor],
  getRevSpecificDoc:[roles.User,roles.Doctor],
};
