import appointmentModel from '../../../DB/model/appointment.model.js';
import doctorModel from '../../../DB/model/doctor.model.js';
import reviewModel from '../../../DB/model/review.model.js';

export const createReview = async (req, res, next) => {
  const { rating, feedback } = req.body;
  const { doctorId } = req.params;
  const patientId = req.user._id;
  //Check if the doctor exists in the Doctor model
  const doctor = await doctorModel.findById(doctorId);

  if (!doctor) {
    return next(new Error('Doctor not found', { cause: 404 }));
  }
  // Check if the user has an appointment with the specified doctor and the status is "pending"
  const pendingAppointment = await appointmentModel.findOne({
    doctorId,
    patientId,
    status: 'Pending',
  });

  if (!pendingAppointment) {
    return next(
      new Error('You do not have a pending appointment with this doctor', {
        cause: 400,
      }),
    );
  }

  // Check if the user has already provided feedback for the same doctor
  const existingReview = await reviewModel.findOne({
    doctorId,
    patientId,
  });
  if (existingReview) {
    return next(
      new Error('You have already reviewed this doctor', { cause: 400 }),
    );
  }
  //Create the review
  const review = await reviewModel.create({
    doctorId,
    patientId,
    rating: Math.round(rating * 2) / 2,
    feedback,
    createdBy: req.user._id,
  });
  // Update the doctor's rating
  const totalReviews = await reviewModel.countDocuments({ doctorId });
  const currentDoctorRating = doctor.rating || 0;

  const newDoctorRating =
    Math.round(
      ((currentDoctorRating * (totalReviews - 1) + rating) / totalReviews) * 2,
    ) / 2;

  // Update the doctor's rating in the Doctor model
  await doctorModel.findByIdAndUpdate(doctorId, { rating: newDoctorRating });

  return res
    .status(201)
    .json({ message: 'Review created successfully', review });
};
export const updateReview = async (req, res, next) => {
  const { rating, feedback } = req.body;
  const { idReview } = req.params;
  const review = await reviewModel.findById(idReview);
  // Check if the review exists in the Review model
  if (!review) {
    return next(new Error('Review not found', { cause: 404 }));
  }
  if (req.user._id.toString() !== review.patientId.toString()) {
    return next(
      new Error('this feedback does not belog you,cant Updated', {
        cause: 404,
      }),
    );
  }

  //Update the review details
  review.rating = Math.round(rating * 2) / 2;
  review.feedback = feedback;
  review.updatedAt = new Date();

  // Save the updated review model
  await review.save();

  //Update the doctor's rating
  const doctorId = review.doctorId;
  const doctor = await doctorModel.findById(doctorId);

  if (!doctor) {
    return next(new Error('Doctor not found', { cause: 404 }));
  }
  const totalReviews = await reviewModel.countDocuments({ doctorId });
  const allReviews = await reviewModel.find({ doctorId });

  // Calculate the new average rating
  let sumRatings = 0;
  allReviews.forEach((review) => {
    sumRatings += review.rating;
  });

  const newDoctorRating =
    totalReviews > 0 ? Math.round((sumRatings / totalReviews) * 2) / 2 : 0;

  // Update the doctor's rating in the Doctor model
  await doctorModel.findByIdAndUpdate(doctorId, { rating: newDoctorRating });

  return res
    .status(200)
    .json({ message: 'Review updated successfully', review });
};
export const deleteReview = async (req, res, next) => {
  const { idReview } = req.params;

  // Check if the review exists in the Review model
  const review = await reviewModel.findById(idReview);
  if (!review) {
    return next(new Error('Review not found', { cause: 404 }));
  }
  if (req.user._id.toString() !== review.patientId.toString()) {
    return next(
      new Error('this feedback does not belog you,cant delete', {
        cause: 404,
      }),
    );
  }

  // Remove the review
  await reviewModel.findByIdAndDelete(idReview);

  // Get the doctor ID before removing the review
  const doctorId = review.doctorId;

  // Update the doctor's rating
  const doctor = await doctorModel.findById(doctorId);

  if (!doctor) {
    return next(new Error('Doctor not found', { cause: 404 }));
  }

  const totalReviews = await reviewModel.countDocuments({ doctorId });
  const allReviews = await reviewModel.find({ doctorId });

  // Calculate the new average rating
  let sumRatings = 0;
  allReviews.forEach((review) => {
    sumRatings += review.rating;
  });

  const newDoctorRating =
    totalReviews > 0 ? Math.round((sumRatings / totalReviews) * 2) / 2 : 0;

  // Update the doctor's rating in the Doctor model
  await doctorModel.findByIdAndUpdate(doctorId, { rating: newDoctorRating });

  return res.status(200).json({ message: 'Review deleted successfully' });
};
export const getReviews = async (req, res, next) => {
  
    const reviews = await reviewModel.find();
    return res.status(200).json({ reviews });
  
};
export const getRevSpecificDoc = async (req, res, next) => {
  const { doctorId } = req.params;
  
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return next(new Error('Doctor not found', { cause: 404 }));
    }


    const reviews = await reviewModel.find({ doctorId });

    return res.status(200).json({ reviews });
 
};

