const Joi = require('@hapi/joi');
const { SUBSCRIPTION } = require('./../../../../config/constant');

const newSchema = () => Joi.object().keys({
  userId: Joi.number().integer().required(),
  subscription: Joi.string().strict().valid(Object.values(SUBSCRIPTION)).required(),
  months: Joi.number().integer().required(),
});

module.exports = newSchema;
