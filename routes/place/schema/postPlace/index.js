const Joi = require('@hapi/joi');

const daySchedule = { start: Joi.number().strict().min(0), end: Joi.number().strict().max(24) };

const newSchema = (validTypes, validExtras) => Joi.object().keys({
  name: Joi.string().strict().required(),
  type: Joi.string().strict().required()
    .valid(validTypes),
  address: Joi.string().strict().required(),
  photos: Joi.array().items(Joi.string()).required(),
  coordinates: Joi.array().min(2).items(Joi.number()).required(),
  socials: Joi.object().keys({
    facebook: Joi.string().strict(),
    tripAdvisor: Joi.string().strict(),
    google: Joi.string().strict(),
    yelp: Joi.string().strict(),
    instagram: Joi.string().strict(),
  }),
  level: Joi.number().required(),
  description: Joi.string().required(),
  schedule: Joi.object().required().keys({
    monday: Joi.object().keys(daySchedule),
    tuesday: Joi.object().keys(daySchedule),
    wednesday: Joi.object().keys(daySchedule),
    thursday: Joi.object().keys(daySchedule),
    friday: Joi.object().keys(daySchedule),
    saturday: Joi.object().keys(daySchedule),
    sunday: Joi.object().keys(daySchedule),
  }),
  slots: Joi.number().required(),
  extra: Joi.array().items(
    Joi.string().strict().valid(validExtras),
  ),
});

module.exports = newSchema;
