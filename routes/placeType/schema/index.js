const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  type: Joi.string().strict().required(),
  image: Joi.string().strict().required().allow(''),
});

module.exports = schema;