const Joi = require('joi');

// Joi schema for validating email and password
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email must be a string.',
      'string.email': 'Invalid email format.',
      'any.required': 'Email is required.',
    }),

  password: Joi.string()
    .min(8)
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*]{8,30}$'))
    .messages({
      'string.base': 'Password must be a string.',
      'string.min': 'Password must be at least 6 characters long.',
      'any.required': 'Password is required.',
    }),
});


const resetPasswordSchema = Joi.object({
    
    newPassword: Joi.string()
      .min(8)
      .max(20)
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long.',
        'string.max': 'Password must not exceed 20 characters.',
        'string.pattern.base': 'Password must contain at least one letter and one number.',
        'any.required': 'New password is required.'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Confirm password must match the new password.',
      'any.required': 'Confirm password is required.'
    }),
  });
  

module.exports = {loginSchema,resetPasswordSchema};