import * as _log from './log';
import { HapiPlugin } from './typings.d';
import { Schema } from 'joi';
export declare const LogPlugin: typeof _log;
/**
 * Shorthand for hapi-swagger return objects
 * @type {[type]}
 */
export declare const returnType: (schema: Schema) => {
    'hapi-swagger': {
        responses: {
            '200': {
                'schema': Schema;
            };
        };
    };
};
export declare const HTTPTweaks: HapiPlugin;
