import { roles } from '../../middleware/auth.js';

export const endPoints = {
  getAllDoctors: [roles.Doctor],
  getScheduleDoctor:[roles.Doctor],
  createSchedule: [roles.Doctor],
  updateSchedule: [roles.Doctor],
  updateDoctorProfile: [roles.Doctor],
  deleteDay: [roles.Doctor],
  deleteAllSchedule:[roles.Doctor],
};
