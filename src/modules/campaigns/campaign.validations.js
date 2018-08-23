import Joi from 'joi';

export default {
  createCampaign: {
    body: {
      name: Joi.string().required(),
      customer_id: Joi.string().required(),
    },
  },
  updateCampaign: {
    body: {
      name: Joi.string().required(),
      customer_id: Joi.string().required(),
    },
  },
};
