import doctorModel from '../../../DB/model/doctor.model.js';
import appointmentModel from '../../../DB/model/appointment.model.js';
import moment from 'moment';

export const createAppointment = async (req, res, next) => {
  const { doctorId, day, time } = req.body;

  // Step 1: Check if the doctor exists in the Doctor model
  const doctor = await doctorModel.findById(doctorId);

  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  const UtcDay = moment.utc(day, 'DD-MM-YYYY', true).toDate();
  //moment(s.day).isSame(dayAsDate, 'day');
  // Step 2: Check if the day exists in the doctor's schedule
  const scheduleDay = doctor.schedule.find((schedule) => {
    return moment(schedule.day).isSame(UtcDay, 'day');
  });

  if (!scheduleDay) {
    return next(new Error('Invalid day for the doctor', { cause: 400 }));
  }

  const formattedTime = moment(time, 'hh:mm a').format('hh:mm a');

  // Step 3: Check if the time exists in divideTimeSlots
  const timeSlot = scheduleDay.divideTimeSlots.find(
    (slot) => slot.text === formattedTime,
  );

  if (!timeSlot) {
    return next(new Error('Invalid time for the doctor', { cause: 400 }));
  } else if (timeSlot.isBooked) {
    return next(
      new Error(
        'The selected time is already booked. Please choose a different time.',
        { cause: 400 },
      ),
    );
  }

  // Step 4: If all checks passed, create and save the appointment
  const appointment = await appointmentModel.create({
    doctorId,
    patientId: req.user._id,
    day: UtcDay,
    dayName: moment(UtcDay).format('dddd'), // Assuming you want the day name
    time: formattedTime,
    status: 'Pending', // You can set the initial status as needed
  });

  // Update the doctor's schedule using findOneAndUpdate
  await doctorModel.findOneAndUpdate(
    {
      _id: doctorId,
      'schedule.day': UtcDay,
      'schedule.divideTimeSlots.text': formattedTime,
    },
    { $set: { 'schedule.$[day].divideTimeSlots.$[slot].isBooked': true } },
    {
      arrayFilters: [{ 'day.day': UtcDay }, { 'slot.text': formattedTime }],
    },
  );

  return res
    .status(201)
    .json({ message: 'Appointment created successfully', appointment });
};

export const getAppointmentForDoctor = async (req, res, next) => {
  const doctorId = req.params.id;
  const doctor = await doctorModel.findById(doctorId);
  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  const appointments = await appointmentModel.find({ doctorId }).populate({
    path: 'doctorId',
    select: 'username email phone',
  });

  return res
    .status(200)
    .json({ message: 'success', count: appointments.length, appointments });
};
export const getAllAppointment = async (req, res, next) => {
  const appointments = await appointmentModel.find().populate({
    path: 'doctorId',
    select: 'username email phone',
  });

  return res
    .status(200)
    .json({ message: 'Success', count: appointments.length, appointments });
};
export const updateAppointment = async (req, res, next) => {
  const { updatedDayy, updatedTimee } = req.body;
  const { idAppointment } = req.params;

  // Step 1: Check if the appointment exists in the  Appointment model
  const appointment = await appointmentModel.findById(idAppointment);

  if (!appointment) {
    return next(new Error('Appointment not found', { cause: 404 }));
  }

  // Step 2: Check if day is the same as updatedDay
  const doctor = await doctorModel.findById(appointment.doctorId);

  if (!doctor) {
    return next(new Error('Doctor not found', { cause: 404 }));
  }

  if (
    !doctor.schedule ||
    !Array.isArray(doctor.schedule) ||
    doctor.schedule.length === 0
  ) {
    return next(
      new Error('Doctor schedule not found or invalid', { cause: 400 }),
    );
  }

  const updatedDay = moment.utc(updatedDayy, 'DD-MM-YYYY', true).toDate();
  const updatedTime = moment(updatedTimee, 'hh:mm a').format('hh:mm a');

  // Check if there is a schedule for the updated day
  const updatedSchedule = doctor.schedule.find((schedule) =>
    moment(schedule.day).isSame(updatedDay, 'day'),
  );

  if (!updatedSchedule) {
    return next(
      new Error('Invalid updated day for the doctor', { cause: 400 }),
    );
  }

  // Check if the time exists in divideTimeSlots and isBooked is false
  const timeSlot = updatedSchedule.divideTimeSlots.find(
    (slot) => slot.text === updatedTime && !slot.isBooked,
  );

  if (!timeSlot) {
    return next(
      new Error('Invalid updated time for the doctor', { cause: 400 }),
    );
  }

  // Update the time in divideTimeSlots and set isBooked to true
  timeSlot.text = updatedTime;
  timeSlot.isBooked = true;

  // Search for the previous time slot in the doctor's schedule for the previous date
  const previousSchedule = doctor.schedule.find((schedule) =>
    moment(schedule.day).isSame(appointment.day, 'day'),
  );

  if (previousSchedule) {
    const previousTimeSlot = previousSchedule.divideTimeSlots.find(
      (slot) => slot.text === appointment.time,
    );
    if (previousTimeSlot) {
      previousTimeSlot.isBooked = false;
    }
  }

  // Save the updated doctor model
  await doctor.save();

  // Update the appointment details
  appointment.day = updatedDay;
  appointment.dayName = moment(updatedDay).format('dddd');
  appointment.time = updatedTime;
  await appointment.save();

  return res
    .status(200)
    .json({ message: 'Appointment updated successfully', appointment });
};






export const deleteAppointment = async (req, res, next) => {

    const { idAppointment } = req.params;

    // Check if the appointment exists in the Appointment model
    const appointment = await appointmentModel.findById(idAppointment);

    if (!appointment) {
      return next(new Error('Appointment not found', { cause: 404 }));
    }

    //Check if the doctor exists in the Doctor model
    const doctor = await doctorModel.findById(appointment.doctorId);

    if (!doctor) {
      return next(new Error('Doctor not found', { cause: 404 }));
    }

    // Check if there is a schedule for the appointment day
    const schedule = doctor.schedule.find((s) =>
      moment(s.day).isSame(appointment.day, 'day'),
    );

    if (!schedule) {
      return next(new Error('Invalid day for the doctor', { cause: 400 }));
    }

    // Find the time slot in divideTimeSlots and set isBooked to false
    const timeSlot = schedule.divideTimeSlots.find(
      (slot) => slot.text === appointment.time,
    );

    if (!timeSlot) {
      return next(new Error('Invalid time for the doctor', { cause: 400 }));
    }

    timeSlot.isBooked = false;

    // Save the updated doctor model
    await doctor.save();

    // Delete the appointment
    await appointmentModel.findByIdAndDelete(idAppointment);

    return res
      .status(200)
      .json({ message: 'Appointment deleted successfully' });
  
};