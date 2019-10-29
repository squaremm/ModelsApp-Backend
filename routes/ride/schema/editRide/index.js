const Joi = require('@hapi/joi');

const locationSchema = Joi.object().keys({
  longitude: Joi.number().required(),
  latitude: Joi.number().required(),
});

const schema = Joi.object().keys({
  rideId: Joi.string().strict().required(),
  driverRideId: Joi.string().strict(),
  from: locationSchema,
  to: locationSchema,
  fromPlace: Joi.number().integer().strict().allow(null),
  toPlace: Joi.number().integer().strict().allow(null),
}).min(2);

module.exports = schema;