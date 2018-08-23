import Joi from 'joi';

export default {
  createTracking: {
    body: {
      device_id: Joi.string().required(),
      location_lat: Joi.string().required(),
      location_long: Joi.string().required()
    },
  },
};
