"use strict";
const Joi = require('joi');
exports.positiveInt = Joi.number().integer().min(0).optional();
const _id = Joi.number().integer().min(0).description('Unique id');
/**
 * Persisted and non persisted version of types are separated in order
 * to generate accurate swagger descriptions
 */
exports.id = { id: _id };
exports.idPersisted = { id: _id.required() };
exports.timestamps = {
    created_at: Joi.date().description('Creation date'),
    updated_at: Joi.date().description('Last update')
};
exports.timestampsRequired = {
    created_at: Joi.date().required().description('Creation date'),
    updated_at: Joi.date().required().description('Last update')
};
exports.bool = Joi.any().valid([0, 1, true, false]);
exports.saneString = Joi.string().max(255).replace(/\0/gi, '');
exports.saneText = Joi.string().max(1024).replace(/\0/gi, '');
//# sourceMappingURL=basic_types.js.map