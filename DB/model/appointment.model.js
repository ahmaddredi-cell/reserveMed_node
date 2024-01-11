import mongoose, { Schema, model, Types } from 'mongoose';

const appointmentSchema = new Schema({
  doctorId: { type: Types.ObjectId, ref: 'Doctor' },
  patientId: { type: Types.ObjectId, ref: 'Patient' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'canceled', 'completed'],
    default: 'scheduled',
  },
});

const appointmentModel = mongoose.models.Appointment || model('Appointment',appointmentSchema);
export default appointmentModel