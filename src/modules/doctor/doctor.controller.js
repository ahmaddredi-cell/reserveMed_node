/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

import doctorModel from '../../../DB/model/doctor.model.js';
import { pagination } from '../../utils/pagination.js';
import cloudinary from '../../utils/cloudinary.js';
import userModel from '../../../DB/model/user.model.js';
import slugify from 'slugify';
import moment from 'moment';
import momentRange from 'moment-range';
const { extendMoment } = momentRange;
extendMoment(moment);

export const getAllDoctor = async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.limit);
  let queryObj = { ...req.query };
  const execQuery = ['page', 'limit', 'skip', 'sort', 'search'];
  execQuery.map((ele) => {
    delete queryObj[ele];
  });

  const doctor = await doctorModel
    .find(
      {
        ...queryObj,
      },
      '-password -slug -role -confirmEmail -sendCode',
    )
    .limit(limit)
    .skip(skip)
    .populate('appointments')
    .populate('review');

  return res.status(200).json({ message: 'all doctors', doctor });
};

export const createSchedule = async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new Error(`doctor not found`, { cause: 400 }));
  }

  // Extract schedule details from the request body
  const { schedule } = req.body;

  if (!Array.isArray(schedule)) {
    return next(new Error('Invalid schedule data', { cause: 404 }));
  }

  const currentDate = moment(); // Get the current date

  for (let { day, timeSlots } of schedule) {
    day = day.trim();
    //use UTC when storing and querying dates and days in MongoDB.
    // preventing potential issues with timezone conversions.
    const dayAsDate = moment.utc(day, 'DD-MM-YYYY', true).toDate();

    // Check if the date is in the past
    if (moment(dayAsDate).isBefore(currentDate, 'day')) {
      return next(
        new Error(
          `Cannot add schedules for past dates. ${day} is already gone.`,
          { cause: 400 },
        ),
      );
    }

    const existingSchedule = doctor.schedule.find((s) =>
      moment(s.day).isSame(dayAsDate, 'day'),
    );

    if (existingSchedule) {
      return next(
        new Error(`Schedule already exists for ${day}.`, {
          cause: 400,
        }),
      );
    }

    // Trim spaces from the input time slots
    const trimmedTimeSlots = timeSlots.map((slot) => slot.trim());

    // Format time slots using 'hh:mm a' format
    const formattedTimeSlots = trimmedTimeSlots.map((slot) =>
      moment(slot, 'HH:mm a').format('hh:mm a'),
    );

    // Assuming formattedTimeSlots is an array of time slots in 'hh:mm a' format
    const startTime = moment(formattedTimeSlots[0], 'hh:mm a');
    let endTime = moment(
      formattedTimeSlots[formattedTimeSlots.length - 1],
      'hh:mm a',
    );
    // Check if the end time is "00:00" and adjust it to "11:59 pm"
    if (endTime.format('HH:mm') === '00:00') {
      endTime = moment('23:59', 'HH:mm');
    }
    //check to ensure that the start time is before and greater than the start time
    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      return next(
        new Error('End time must be after and greater than the start time', {
          cause: 400,
        }),
      );
    }

    // Create divideTimeSlots based on existing timeSlots
    const divideTimeSlots = [];
    const timeRange = moment.range(startTime, endTime.subtract(1, 'minute'));

    for (let slot of timeRange.by('hour')) {
      divideTimeSlots.push({ text: slot.format('hh:mm a') });
    }

    // Calculate the no of slots
    const noOfSlots = divideTimeSlots.length;
    doctor.schedule.push({
      day: dayAsDate,
      dayName: moment.utc(dayAsDate).format('dddd'),
      timeSlots: formattedTimeSlots,
      divideTimeSlots: divideTimeSlots,
      noOfSlots,
    });
  }

  doctor.schedule.sort((a, b) => a.day - b.day);

  const updatedDoctor = await doctor.save();

  const formattedSchedules = updatedDoctor.schedule.map((schedule) => {
    return {
      day: moment(schedule.day).format('DD-MM-YYYY'),
      dayName: moment(schedule.day).format('dddd'),
      timeSlots: schedule.timeSlots,
      divideTimeSlots: schedule.divideTimeSlots,
      noOfSlots: schedule.noOfSlots,
    };
  });

  res.status(200).json(formattedSchedules);
};
export const getScheduleDoctor = async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  // Format dates and get corresponding days
  const formattedSchedules = doctor.schedule.map((schedule) => {
    return {
      day: moment(schedule.day).format('DD-MM-YYYY'),
      dayName: moment(schedule.day).format('dddd'),
      timeSlots: schedule.timeSlots,
      noOfSlots: schedule.noOfSlots,
    };
  });

  res.status(200).json({
    message: 'Doctor schedule retrieved successfully.',
    schedules: formattedSchedules,
  });
};
export const updateSchedule = async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  if (req.user._id.toString() !== doctor._id.toString()) {
    return next(
      new Error('this schedule does not belog you,cant update', {
        cause: 404,
      }),
    );
  }
  const { day, updatedDay, updatedTimeSlots } = req.body;

  const trimmedDay = day.trim();
  const dayAsDate = moment.utc(trimmedDay, 'DD-MM-YYYY', true).toDate();

  const trimmedUpdatedDay = updatedDay.trim();
  const updatedDayAsDate = moment
    .utc(trimmedUpdatedDay, 'DD-MM-YYYY', true)
    .toDate();

  // Check if the original day exists in the schedule
  const isDayExist = doctor.schedule.some((s) =>
    moment(s.day).isSame(dayAsDate, 'day'),
  );

  if (!isDayExist) {
    return next(
      new Error(`Schedule not found for ${trimmedDay}.`, {
        cause: 404,
      }),
    );
  }

  // Check if the updated day is in the past
  const currentDate = moment();
  if (moment(updatedDayAsDate).isBefore(currentDate, 'day')) {
    return next(
      new Error(
        `Cannot update schedule for past dates. ${trimmedUpdatedDay} is already gone.`,
        {
          cause: 400,
        },
      ),
    );
  }

  // Check if the updated day already exists in the schedule
  const isUpdatedDayExist = doctor.schedule.some(
    (s) =>
      moment(s.day).isSame(updatedDayAsDate, 'day') &&
      s.day.toString() !== dayAsDate.toString(),
  );

  if (isUpdatedDayExist) {
    return next(
      new Error(`Schedule already exists for ${trimmedUpdatedDay}.`, {
        cause: 400,
      }),
    );
  }
  // Find the index of the schedule entry to update
  const existingScheduleIndex = doctor.schedule.findIndex((s) =>
    moment(s.day).isSame(dayAsDate, 'day'),
  );

  if (existingScheduleIndex === -1) {
    return next(
      new Error(`Schedule not found for ${trimmedDay}.`, { cause: 404 }),
    );
  }

  // Trim spaces from the input time slots
  const trimmedUpdatedTimeSlots = updatedTimeSlots.map((slot) => slot.trim());

  // Format time slots using 'hh:mm a' format
  const formattedUpdatedTimeSlots = trimmedUpdatedTimeSlots.map((slot) =>
    moment(slot, 'HH:mm a').format('hh:mm a'),
  );

  const startTime = moment(formattedUpdatedTimeSlots[0], 'hh:mm a');
  let endTime = moment(
    formattedUpdatedTimeSlots[formattedUpdatedTimeSlots.length - 1],
    'hh:mm a',
  );

  // Check if the end time is "00:00" and adjust it to "11:59 pm"
  if (endTime.format('HH:mm') === '00:00') {
    endTime = moment('23:59', 'HH:mm');
  }
  //check to ensure that the start time is before and greater than the start time
  if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
    return next(
      new Error('End time must be after and greater than the start time', {
        cause: 400,
      }),
    );
  }
  // Create divideTimeSlots based on existing timeSlots
  const divideTimeSlots = [];
  const timeRange = moment.range(startTime, endTime.subtract(1, 'minute'));

  for (let slot of timeRange.by('hour')) {
    divideTimeSlots.push({ text: slot.format('hh:mm a') });
  }

  // Calculate the number of slots
  const noOfSlots = divideTimeSlots.length;

  // Update the existing schedule with new time slots and day
  if (dayAsDate === updatedDayAsDate) {
    // Allow updating timeSlots only when day is equal to updatedDay
    doctor.schedule[existingScheduleIndex].timeSlots =
      formattedUpdatedTimeSlots;
  } else {
    // Otherwise, update day and timeSlots
    doctor.schedule[existingScheduleIndex].day = updatedDayAsDate;
    doctor.schedule[existingScheduleIndex].timeSlots =
      formattedUpdatedTimeSlots;
  }
  // Update the noOfSlots in the schedule
  doctor.schedule[existingScheduleIndex].noOfSlots = noOfSlots;
  doctor.schedule[existingScheduleIndex].divideTimeSlots = divideTimeSlots;
  doctor.schedule.sort((a, b) => a.day - b.day);

  // Save the updated doctor
  const updatedDoctor = await doctor.save();

  // Format dates and get corresponding days
  const formattedSchedules = updatedDoctor.schedule.map((schedule) => {
    return {
      day: moment(schedule.day).format('DD-MM-YYYY'),
      dayName: moment(schedule.day).format('dddd'),
      timeSlots: schedule.timeSlots,
      divideTimeSlots: schedule.divideTimeSlots,
      noOfSlots: schedule.noOfSlots,
    };
  });

  res.status(200).json(formattedSchedules);
};
export const updateDoctorProfile = async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  const { userName, email, ticketPrice, specialization, phone, address } =
    req.body;
  const existingName = await doctorModel.findOne({
    userName,
    _id: { $ne: doctor._id }, // Exclude the current doctor
  });

  if (existingName) {
    return next(new Error(`DOCTOR ${userName} already exists`, { cause: 409 }));
  }
  doctor.slug = slugify(userName);

  const existingDoctor = await doctorModel.findOne({
    email,
    _id: { $ne: doctor._id }, // Exclude the current doctor
  });

  if (existingDoctor) {
    return next(new Error('Email already exists', { cause: 409 }));
  }
  // If the email is changed, set confirmEmail to false
  if (email !== doctor.email) {
    doctor.confirmEmail = false;
  }

  // Check if the updated email already exists in userModel
  const existingUser = await userModel.findOne({
    email,
    _id: { $ne: doctor._id }, // Exclude the current user
  });

  if (existingUser) {
    return next(new Error('Email already exists', { cause: 409 }));
  }

  doctor.userName = userName;
  doctor.email = email;
  doctor.ticketPrice = ticketPrice;
  doctor.specialization = specialization;
  doctor.phone = phone;
  doctor.address = address;

  // Update the doctor's image if a new one is provided
  if (req.file) {
    // Delete the existing image on cloudinary
    await cloudinary.uploader.destroy(doctor.image.public_id);

    // Upload the new image to cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/doctors`,
      },
    );

    doctor.image = { secure_url, public_id };
  }
  // Save the updated doctor information
  const updatedDoctor = await doctor.save();
  const formattedDoctor = {
    userName: updatedDoctor.userName,
    email: updatedDoctor.email,
    ticketPrice: updatedDoctor.ticketPrice,
    specialization: updatedDoctor.specialization,
    phone: updatedDoctor.phone,
    address: updatedDoctor.address,
    image: updatedDoctor.image,
  };
  // Prepare the response message
  let message = 'Doctor profile updated, ';
  if (!updatedDoctor.confirmEmail) {
    message += 'Please confirm your email.';
  }

  return res.status(200).json({ message, doctor: formattedDoctor });
};
export const deleteDay = async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  if (req.user._id.toString() !== doctor._id.toString()) {
    return next(
      new Error('this schedule does not belog you,cant delete', {
        cause: 404,
      }),
    );
  }
  const { day } = req.body;
  const trimmedDay = day.trim();
  const dayAsDate = moment.utc(trimmedDay, 'DD-MM-YYYY', true).toDate();

  // Find the index of the day to delete in the schedule
  const dayIndexToDelete = doctor.schedule.findIndex((s) =>
    moment(s.day).isSame(moment(dayAsDate, 'day')),
  );

  if (dayIndexToDelete === -1) {
    return next(
      new Error(`Schedule not found for ${dayAsDate}.`, { cause: 404 }),
    );
  }

  // Remove the day from the schedule
  doctor.schedule.splice(dayIndexToDelete, 1);

  // Save the updated doctor
  const updatedDoctor = await doctor.save();

  // Format dates and get corresponding days
  const formattedSchedules = updatedDoctor.schedule.map((schedule) => {
    return {
      day: moment(schedule.day).format('DD-MM-YYYY'),
      dayName: moment(schedule.day).format('dddd'),
      timeSlots: schedule.timeSlots,
      divideTimeSlots: schedule.divideTimeSlots,
    };
  });

  res.status(200).json({
    message: `The schedule for ${moment(dayAsDate).format(
      'DD-MM-YYYY',
    )} has been successfully deleted.`,
    schedules: formattedSchedules,
  });
};
export const deleteAllSchedule = async (req, res, next) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) {
    return next(new Error('Doctor not Found', { cause: 404 }));
  }
  if (req.user._id.toString() !== doctor._id.toString()) {
    return next(
      new Error('this schedule does not belog you,cant delete', {
        cause: 404,
      }),
    );
  }

  // Clear the schedule array for the doctor
  doctor.schedule = [];

  // Save the updated doctor
  const updatedDoctor = await doctor.save();

  res.status(200).json({
    message: 'All schedules deleted successfully.',
    schedules: updatedDoctor.schedule,
  });
};
