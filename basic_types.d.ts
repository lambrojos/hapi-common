import * as Joi from 'joi';
export declare const positiveInt: Joi.NumberSchema;
/**
 * Persisted and non persisted version of types are separated in order
 * to generate accurate swagger descriptions
 */
export declare const id: Joi.SchemaMap;
export declare const idPersisted: Joi.SchemaMap;
export declare const timestamps: Joi.SchemaMap;
export declare const timestampsRequired: Joi.SchemaMap;
export declare const bool: Joi.Schema;
export declare const saneString: Joi.StringSchema;
export declare const saneText: Joi.StringSchema;
