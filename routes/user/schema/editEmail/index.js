const Joi = require('@hapi/joi');

const newSchema = Joi.object().keys({
  email: Joi.string().email().required(),
});

module.exports = newSchema;
