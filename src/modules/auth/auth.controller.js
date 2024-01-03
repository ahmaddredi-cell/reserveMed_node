/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

export const signup = async (req, res, next) => {
  return res.status(200).json({ message: 'sighin' });
};
