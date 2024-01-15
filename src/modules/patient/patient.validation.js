import Joi from 'joi';
import { generalFields } from '../../middleware/validation.js';
import { idSchema } from '../doctor/doctor.validation.js';

const email = generalFields.email.required();
const file = generalFields.file.required();


// Validation for updating the doctor's profile
const updateUserProfile = Joi.object({
  id: idSchema,
  userName: Joi.string().min(3).max(25).required(),
  email,
  phone: Joi.string().trim()
    .regex(/^05\d{2}-?\d{6}$/)
    .required(),
  address: Joi.string().trim().required(),
  file,
});

export {updateUserProfile};
