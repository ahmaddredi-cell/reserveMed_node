import { roles } from '../../middleware/auth.js';

export const endPointsPatient = {
  updateUserProfile:[roles.User]
};
