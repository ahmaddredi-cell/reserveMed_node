import mongoose, { Schema, model, Types } from 'mongoose';

const appointmentSchema = new Schema({
  patientId: { type: Types.ObjectId, ref: 'Patient' },

  doctorId: { type: Types.ObjectId, ref: 'Doctor' },
  day: { type: Date, required: true },
  dayName: { type: String },
  time: {type:String,required:true},
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  },
});

const appointmentModel =
  mongoose.models.Appointment || model('Appointment', appointmentSchema);
export default appointmentModel;
