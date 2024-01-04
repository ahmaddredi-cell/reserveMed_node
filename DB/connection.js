/* eslint-disable no-console */
import mongoose from 'mongoose';

const connectDB = async () => {
  return await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('connect successfully');
    })
    .catch((err) => {
      console.log(`not connected ${err}`);
    });
};

export default connectDB;
