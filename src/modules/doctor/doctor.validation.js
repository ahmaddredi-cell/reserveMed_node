import Joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

const email = generalFields.email.required();
const file = generalFields.file.required();

const idSchema = Joi.string().length(24).hex().required();

const time24HourFormatSchema = Joi.string()
  .trim()
  .pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);

const time12HourFormatSchema = Joi.string()
  .trim()
  .pattern(/^((0?[1-9]|1[0-2]):[0-5][0-9]( )?(AM|PM))$/i);

const daySchema = Joi.string()
  .trim()
  .pattern(/^\d{2}-\d{2}-\d{4}$/)
  .required();

const scheduleItemSchema = Joi.object({
  day: daySchema,
  timeSlots: Joi.array()
    .items(time24HourFormatSchema, time12HourFormatSchema)
    .required(),
});

// Validation for getting all doctors
const getAllDoctor = Joi.object({
  page: Joi.number().positive(),
  limit: Joi.number().positive(),
  skip: Joi.number().positive(),
  sort: Joi.string(),
  search: Joi.string(),
});

// Validation for creating a schedule
const createSchedule = Joi.object({
  id: idSchema,
  schedule: Joi.array().items(scheduleItemSchema).required(),
});

// Validation for updating a schedule
const updateSchedule = Joi.object({
  id: idSchema,
  day: daySchema,
  updatedDay: daySchema,
  updatedTimeSlots: Joi.array()
    .items(time24HourFormatSchema, time12HourFormatSchema)
    .required(),
});

// Validation for updating the doctor's profile
const updateDoctorProfile = Joi.object({
  id: idSchema,
  userName: Joi.string().min(3).max(25).required(),
  email,
  ticketPrice: Joi.number().positive().required(),
  specialization: Joi.string().trim().required(),
  phone: Joi.string().trim()
    .regex(/^05\d{2}-?\d{6}$/)
    .required(),
  address: Joi.string().trim().required(),
  file,
});
// Validation for deleting a day from the schedule
const deleteDay = Joi.object({
  id: idSchema,
  day: daySchema,
});
// Validation for deleting a day from the schedule
const deleteAllSchedule = Joi.object({
  id: idSchema,
});
// Validation for deleting a day from the schedule
const getScheduleDoctor = Joi.object({
  id: idSchema,
});
export { createSchedule, getScheduleDoctor,updateSchedule, getAllDoctor, updateDoctorProfile,deleteDay,deleteAllSchedule };
