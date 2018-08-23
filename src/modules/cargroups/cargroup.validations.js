import Joi from 'joi';

export default {
  createCarGroup: {
    body: {
      full_name: Joi.string().required(),
      phone: Joi.string().required(),
      leader_id: Joi.string().required(),
    },
  },
  updateCarGroup: {
    body: {
      full_name: Joi.string().required(),
      phone: Joi.string().required(),
      leader_id: Joi.string().required(),
    },
  },
};
