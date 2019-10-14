const Joi = require('@hapi/joi');

const newSchema = (validTypes) => Joi.object().keys({
  type: Joi.string().strict().required().valid(validTypes),
  name: Joi.string().strict().required(),
  image: Joi.string().strict().required().allow(''),
});

module.exports = newSchema;
