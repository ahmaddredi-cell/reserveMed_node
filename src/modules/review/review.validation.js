import Joi from 'joi';
import { idSchema } from '../doctor/doctor.validation.js';

const rating = Joi.number().min(1).max(5).required();
const feedback = Joi.string().trim().max(500).required();

// Validation for updating the doctor's profile
const createReview = Joi.object({
  doctorId: idSchema,
  rating: rating,
  feedback: feedback,
});
const updateReview = Joi.object({
  idReview: idSchema,
  rating: rating,
  feedback: feedback,
});
const deleteReview = Joi.object({
  idReview: idSchema,
});

const getRevSpecificDoc = Joi.object({
  doctorId: idSchema,
});
export { createReview, updateReview, deleteReview, getRevSpecificDoc };
