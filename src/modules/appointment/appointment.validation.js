import Joi from 'joi';
import { idSchema,daySchema,time12HourFormatSchema,time24HourFormatSchema} from '../doctor/doctor.validation.js'



// Validation for updating the doctor's profile
const createAppointment = Joi.object({
  doctorId: idSchema,
  day: daySchema,
  time: Joi.alternatives()
    .try(time24HourFormatSchema, time12HourFormatSchema)
    .required(),
});
const getAppointmentForDoctor = Joi.object({
  id: idSchema,
});
const updateAppointment = Joi.object({
  idAppointment: idSchema,
  updatedDayy: daySchema,
  updatedTimee: Joi.alternatives()
    .try(time24HourFormatSchema, time12HourFormatSchema)
    .required(),
});
const deleteAppointment = Joi.object({
  idAppointment: idSchema,
});


export { createAppointment, getAppointmentForDoctor,updateAppointment,deleteAppointment };
