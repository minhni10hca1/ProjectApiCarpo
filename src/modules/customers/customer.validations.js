import Joi from 'joi';

export default {
  createCustomer: {
    body: {
      company_name: Joi.string().min(3).required(),
      address: Joi.string().required(),
      customer_id: Joi.string().required(),
    },
  },
  updateCustomer: {
    body: {
      company_name: Joi.string().min(3).required(),
      address: Joi.string().required(),
      customer_id: Joi.string().required(),
    },
  },
};
