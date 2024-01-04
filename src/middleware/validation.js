import joi from 'joi';

export const generalFields = {
  email: joi.string().email().required().min(5).messages({
    'string.empty': 'email is required',
    'string.email': 'plz enter a valid email',
  }),
  password: joi.string().required().min(5).messages({
    'string.empty': 'password is required',
  }),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
    dest: joi.string(),
  }),
};

export const validation = (schema) => (req, res, next) => {
  const inputsData = { ...req.body, ...req.params, ...req.query };

  if (req.file || req.files) {
    inputsData.file = req.file || req.files;
  }

  const { error } = schema.validate(inputsData, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => ({
      message: detail.message,
      path: detail.path.join('.'),
    }));

    return res.status(400).json({
      message: 'Validation Error',
      errors,
    });
  }

  next();
};
