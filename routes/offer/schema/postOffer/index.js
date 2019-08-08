const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  name: Joi.string().strict().required(),
  userID: Joi.number().required(),
  composition: Joi.array().items(Joi.string()).required(),
  price: Joi.number().required(),
  timeframes: Joi.array().items(Joi.string()).required(),
  photo: Joi.string().strict().required(),
  level: Joi.number(),
  credits: Joi.object().required(),
});

module.exports = schema;
