import { roles } from '../../middleware/auth.js';

export const endPoints = {
  createAppointment: [roles.User],
  getAppointment: [roles.Doctor],
  getAllAppointment: [roles.User, roles.Doctor],
  updateAppointment:[roles.User, roles.Doctor] ,
  deleteAppointment:[roles.User, roles.Doctor],
};
