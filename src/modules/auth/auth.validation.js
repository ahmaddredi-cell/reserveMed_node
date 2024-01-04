import Joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

const email = generalFields.email.required();
const password = generalFields.password.required();
//if was one file
const file = generalFields.file.required();

export const signUp = Joi.object({
  userName: Joi.string().min(3).max(25).required(),
  email,
  password,
  file,
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
