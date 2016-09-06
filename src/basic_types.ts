import * as Joi from 'joi'

export const positiveInt = Joi.number().integer().min(0).optional()
const _id = Joi.number().integer().min(0).description('Unique id')


/**
 * Persisted and non persisted version of types are separated in order
 * to generate accurate swagger descriptions
 */
export const id: Joi.SchemaMap = { id: _id }
export const idPersisted: Joi.SchemaMap = {id: _id.required() }

export const timestamps: Joi.SchemaMap = {
  created_at: Joi.date().description('Creation date'),
  updated_at: Joi.date().description('Last update')
}

export const timestampsRequired: Joi.SchemaMap = {
  created_at: Joi.date().required().description('Creation date'),
  updated_at: Joi.date().required().description('Last update')
}

export const bool = Joi.any().valid([0, 1, true, false])
export const saneString = Joi.string().max(255).replace(/\0/gi, '')
export const saneText = Joi.string().max(1024).replace(/\0/gi, '')
