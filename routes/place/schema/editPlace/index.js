const Joi = require('@hapi/joi');
const { ACCESS } = require('./../../constant');
const { GENDERS } = require('./../../../user/constant');

const daySchedule = { start: Joi.number().strict().min(0), end: Joi.number().strict().max(24) };

const newSchema = (validTypes, validExtras) => Joi.object().keys({
  isActive: Joi.boolean().strict(),
  tags: Joi.array().items(Joi.string().strict()),
  phone: Joi.string().strict(),
  instapage: Joi.string().strict(),
  name: Joi.string().strict(),
  type: Joi.string().strict().valid(validTypes),
  address: Joi.string().strict(),
  photo: Joi.string().strict(),
  photos: Joi.array().items(Joi.string()),
  location: Joi.object().keys({coordinates: Joi.array().min(2).items(Joi.number())}),
  socials: Joi.object().keys({
    facebook: Joi.string().strict(),
    tripAdvisor: Joi.string().strict(),
    google: Joi.string().strict(),
    yelp: Joi.string().strict(),
    instagram: Joi.string().strict(),
  }),
  level: Joi.number().integer(),
  description: Joi.string(),
  schedule: Joi.object().keys({
    monday: Joi.object().keys(daySchedule),
    tuesday: Joi.object().keys(daySchedule),
    wednesday: Joi.object().keys(daySchedule),
    thursday: Joi.object().keys(daySchedule),
    friday: Joi.object().keys(daySchedule),
    saturday: Joi.object().keys(daySchedule),
    sunday: Joi.object().keys(daySchedule),
  }),
  slots: Joi.number().integer(),
  extra: Joi.array().items(
    Joi.string().strict().valid(validExtras),
  ),
  access: Joi.string().strict().valid(Object.values(ACCESS)),
  allows: Joi.array().items(Joi.string().valid(Object.values(GENDERS))),
});

module.exports = newSchema;
