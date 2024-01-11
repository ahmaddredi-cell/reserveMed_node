import mongoose, { Schema, model, Types } from 'mongoose';

const reviewSchema = new Schema({
  doctorId: {
    type: Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientId: {
    type: Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String },
  createdBy: {
    type: Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
});
const reviewModel = mongoose.models.Review || model('Review',reviewSchema);
export default reviewModel