import Joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

const email = generalFields.email.required();
const password = generalFields.password.required();
// if it was one file
const file = generalFields.file.required();

export const signUpDoctor = Joi.object({
  userName: Joi.string().min(3).max(25).required(),
  email,
  password,
  file,
  gender: Joi.string().valid('Male', 'Female').required(),
  ticketPrice:Joi.number().positive().required(),
  specialization:Joi.string().required(),
  phone: Joi.string()
    .regex(/^05\d{2}-?\d{6}$/)
    .required(),
  address: Joi.string().required(),
});
export const signUpUser = Joi.object({
  userName: Joi.string().min(3).max(25).required(),
  email,
  password,
  file,
  gender: Joi.string().valid('Male', 'Female').required(),
  bloodType: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .required(),
  phone: Joi.string()
    .regex(/^05\d{2}-?\d{6}$/)
    .required(),
  address: Joi.string().trim().required(),
});


export const signIn = Joi.object({
  email,
  password,
});

export const sendCode = Joi.object({
  email,
});

export const forgotPassword = Joi.object({
  email,
  password,
  code: Joi.string().length(4).required(),
});
