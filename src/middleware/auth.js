import jwt from 'jsonwebtoken';
import userModel from '../../DB/model/user.model.js';
import { asyncHandler } from '../utils/errorHandling.js';

export const roles = {
  Admin: 'Admin',
  User: 'User',
};
export const auth = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARERKEY)) {
      return next(new Error(`Invalid authorization`, { cause: 401 }));
    }

    const token = authorization.split(process.env.BEARERKEY)[1];
    const decoded = jwt.verify(token, process.env.LOGINSECRET);
    if (!decoded) {
      return next(new Error(`Invalid authorization`, { cause: 401 }));
    }

    const user = await userModel
      .findById(decoded.id)
      .select('userName role changePasswordTime');

    if (!user) {
      return next(new Error(`User not registered`, { cause: 401 }));
    }

    if (parseInt(user.changePasswordTime?.getTime() / 1000) > decoded.iat) {
      return next(new Error(`Expired token, please login`, { cause: 400 }));
    }

    if (accessRoles.length > 0 && !accessRoles.includes(user.role)) {
      return next(new Error(`Not authorized user`, { cause: 403 }));
    }

    req.user = user;
    next();
  });
};
