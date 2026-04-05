const Joi = require('joi');
const {ROLES, RECORD_TYPES, USER_STATUS} = require('../constants');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(ROLES)).default(ROLES.VIEWER),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  role: Joi.string().valid(...Object.values(ROLES)),
  status: Joi.string().valid(...Object.values(USER_STATUS)),
});

const createRecordSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type:  Joi.string().valid(...Object.values(RECORD_TYPES)).required(),
  category: Joi.string().min(1).max(100).required(),
  date: Joi.date().isoDate().required(),
  notes: Joi.string().max(500).allow('', null),
});

const updateRecordSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type:  Joi.string().valid(...Object.values(RECORD_TYPES)),
  category: Joi.string().min(1).max(100),
  date: Joi.date().isoDate(),
  notes: Joi.string().max(500).allow('', null),
}).min(1);

const recordFilterSchema = Joi.object({
  type: Joi.string().valid(...Object.values(RECORD_TYPES)),
  category: Joi.string(),
  startDate: Joi.date().isoDate(),
  endDate: Joi.date().isoDate(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100),
});

module.exports = {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
};