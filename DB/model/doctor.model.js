import mongoose, { Schema, model, Types } from 'mongoose';

const doctorSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    phone: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    role: {
      type: String,
      default: 'Doctor',
    },
    ticketPrice: {
      type: Number,
    },
    //FIeld for doctors only
    specialization: {
      type: String,
    },
    qualifications: [String],
    experiences: [String],
    bio: {
      type: String,
      maxLength: 50,
    },
    about: {
      type: String,
    },
    schedule: [
      {
        day: { type: Date, required: true },
        dayName: { type: String },
        timeSlots: [{ type: String, required: true }],
        divideTimeSlots: [
          {
            text: { type: String},
            isBooked: { type: Boolean, default: false },
          },
        ],
        noOfSlots: { type: Number, default: 0 },
      },
    ],
    reviews: [
      {
        type: Types.ObjectId,
        ref: 'Review',
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    sendCode: {
      type: String,
      default: null,
    },
    
  },
  { timestamps: true,toJSON:{virtuals:true},toObject:{virtuals:true} },
);
doctorSchema.virtual('appointments', {
  localField: '_id',
  foreignField: 'doctorId',
  ref: 'Appointment',
});
const doctorModel = mongoose.models.Doctor || model('Doctor', doctorSchema);
export default doctorModel;
