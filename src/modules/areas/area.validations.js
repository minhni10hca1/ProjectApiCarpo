import Joi from 'joi';

export default {
  createArea: {
    body: {
      code: Joi.string().required(),
      name: Joi.string().required(),
    },
  },
  updateArea: {
    body: {
      code: Joi.string().required(),
      name: Joi.string().required(),
    },
  },
};
