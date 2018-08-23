import Joi from 'joi';

export default {
  createDriver: {
    body: {
      full_name: Joi.string().required(),
    },
  },
  updateDriver: {
    body: {
      full_name: Joi.string().required(),
    },
  },
};
