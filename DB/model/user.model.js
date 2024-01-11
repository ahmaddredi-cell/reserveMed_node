import mongoose, { Schema, model,Types } from 'mongoose';

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'username is require'],
      trim: true,
      min: 4,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },

    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive'],
    },
    role: {
      type: String,
      default: 'Patient',
    },
    sendCode: {
      type: String,
      default: null,
    },
    changePasswordTime: {
      type: Date,
    },
    online: {
      type: Boolean,
      default: false,
    },
    appointments: [
      {
        doctorId: { type:Types.ObjectId, ref: 'Doctor' },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        status: {
          type: String,
          enum: ['scheduled', 'canceled', 'completed'],
          default: 'scheduled',
        },
      },
    ],
  },
  { timestamps: true },
);
const userModel = mongoose.models.User || model('User', userSchema);
export default userModel;
