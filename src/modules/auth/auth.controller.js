/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
import userModel from '../../../DB/model/user.model.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../../utils/cloudinary.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../utils/email.js';
import { customAlphabet } from 'nanoid';

export const signUp = async (req, res, next) => {
  const { userName, email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    //return res.status(409).json({ message: "email exists" });
    return next(new Error('email exists', { cause: 409 }));
  }
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT_ROUND),
  );

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/users`,
    },
  );
  const token = jwt.sign({ email }, process.env.CONFIRMEMAILSECRET);
  const html = `<a href='${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}'>verify</a>`;
  await sendEmail(email, 'confirm email', html);
  const createUser = await userModel.create({
    userName,
    email,
    password: hashedPassword,
    image: { secure_url, public_id },
  });

  return res.status(201).json({ message: 'success', createUser });
};

export const confirmEmail = async (req, res, next) => {
  const token = req.params.token;
  const decoded = jwt.verify(token, process.env.CONFIRMEMAILSECRET);
  if (!decoded) {
    return next(new Error('Invalid token', { cause: 404 }));
  }
  const user = await userModel.findOneAndUpdate(
    { email: decoded.email, confirmEmail: false },
    { confirmEmail: true },
  );
  if (!user) {
    return next(
      new Error('Invalid verify OR your Email is verified', { cause: 400 }),
    );
  }
  return res.redirect(process.env.LOGINFRONTEND);
  //return res.status(200).json({ message: "your Email is verified" });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error('data Invalid', { cause: 400 }));
  }
  if (!user.confirmEmail) {
    return next(new Error('plz confirm your Email', { cause: 400 }));
  }
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return next(new Error('data Invalid', { cause: 400 }));
  }
  const token = jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    process.env.LOGINSECRET, //,{ expiresIn: "5m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    process.env.LOGINSECRET,
    { expiresIn: 60 * 60 * 24 * 30 },
  );
  return res.status(200).json({ message: 'success', token, refreshToken });
};

export const sendCode = async (req, res, next) => {
  const { email } = req.body;
  // Check if the email is registered
  const existingUser = await userModel.findOne({ email });

  if (!existingUser) {
    return next(new Error('not register account', { cause: 404 }));
  }
  // Generate a 4-digit code
  let code = customAlphabet('123456789atyuio@#$&sdASCFER', 4);
  code = code();
  // Update user's sendCode field
  await userModel.findOneAndUpdate(
    { email },
    { sendCode: code },
    { new: true },
  );
  // Prepare email content
  const html = `<h2>your codeis ${code}</h2>`;
  // Send the code via email
  await sendEmail(email, `reset password`, html);
  // Redirect to the forgot password form
  return res.redirect(process.env.FORGOTPASSWORDFORM);
};

export const forgotPassword = async (req, res, next) => {
  const { email, password, code } = req.body;
  const user = await userModel.findOne({ email });
  // Check if the user is registered
  if (!user) {
    return next(new Error('not register account', { cause: 404 }));
  }
  // Check if the provided code matches the stored code
  if (user.sendCode !== code) {
    return next(new Error('Invalid Code', { cause: 400 }));
  }
  // Check if the new password is the same as the old password
  const isSamePassword = await bcrypt.compare(password, user.password);
  if (isSamePassword) {
    return next(new Error('same old password', { cause: 409 }));
  }
  // Hash and update the password
  user.password = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  user.sendCode = null;
  user.changePasswordTime = Date.now();
  // Save the updated user
  await user.save();
  return res.status(200).json({ message: 'success' });
};
