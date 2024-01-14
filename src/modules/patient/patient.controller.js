import doctorModel from "../../../DB/model/doctor.model.js";
import userModel from "../../../DB/model/user.model.js";
import cloudinary from "../../utils/cloudinary.js";



export const updateUserProfile = async (req, res, next) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    return next(new Error('user not Found', { cause: 404 }));
  }
  const { userName, email, phone, address } =
    req.body;
  const existingName = await userModel.findOne({
    userName,
    _id: { $ne: user._id }, // Exclude the current user
  });

  if (existingName) {
    return next(new Error(`USER ${userName} already exists`, { cause: 409 }));
  }


  const existingUser = await userModel.findOne({
    email,
    _id: { $ne: user._id }, // Exclude the current user
  });

  if (existingUser) {
    return next(new Error('Email already exists', { cause: 409 }));
  }
  // If the email is changed, set confirmEmail to false
  if (email !== user.email) {
    user.confirmEmail = false;
  }

  // Check if the updated email already exists in userModel
  const existingDoctor = await doctorModel.findOne({
    email,
    _id: { $ne: user._id }, // Exclude the current user
  });

  if (existingDoctor) {
    return next(new Error('Email already exists', { cause: 409 }));
  }

  user.userName = userName;
  user.email = email;
  user.phone = phone;
  user.address = address;

  // Update the doctor's image if a new one is provided
  if (req.file) {
    // Delete the existing image on cloudinary
    await cloudinary.uploader.destroy(user.image.public_id);

    // Upload the new image to cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/users`,
      },
    );

    user.image = { secure_url, public_id };
  }
  // Save the updated doctor information
  const updatedUser = await user.save();
  const formattedUser = {
    userName: updatedUser.userName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    image: updatedUser.image,
  };
  // Prepare the response message
  let message = 'User profile updated, ';
  if (!updatedUser.confirmEmail) {
    message += 'Please confirm your email.';
  }

  return res.status(200).json({ message, doctor: formattedUser });
};
