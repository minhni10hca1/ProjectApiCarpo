import Joi from 'joi';

export default {
  createRole: {
    body: {
      Name: Joi.string().min(3).required()
    },
  },
  updateRole: {
    body: {
      Description: Joi.string()
    },
  },
};
