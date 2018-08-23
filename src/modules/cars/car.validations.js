import Joi from 'joi';

export default {
  createCar: {
    body: {
      license_plate: Joi.string().required(),
      device_id: Joi.string().required(),
      user_id: Joi.string().required(),
    },
  },
  updateCar: {
    body: {
      license_plate: Joi.string().required(),
      device_id: Joi.string().required(),
      user_id: Joi.string().required(),
    },
  },
};
