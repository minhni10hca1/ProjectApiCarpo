import Joi from 'joi';

//export const passwordReg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

export default {
  signup: {
    body: {
      email: Joi.string().email().required(),
     // password: Joi.string().regex(passwordReg).required(),
      fullname: Joi.string().required(),
      username: Joi.string().required(),
      phone: Joi.string().required()
    },
  },
  signin: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    },
  },
  changepassword: {
    body: {
      oldpassword: Joi.string().required(),
      //newpassword: Joi.string().regex(passwordReg).required()
    },
  },
  update: {
    body: {
      email: Joi.string().email().required(),
      fullname: Joi.string().required(),
      phone: Joi.string().required()
    },
  },
};
