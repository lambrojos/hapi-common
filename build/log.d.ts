/**
 * @module log
 * Adds log4js integration
 * - every request is logged
 * - intercept api log event originating from server.log and logs them
 *
 * Requires Hapi Config installed
 */
import * as Log4js from 'log4js';
import { HapiPlugin } from '../typings/typings.d';
/**
 * Convience method to structure log with an object containing `msg: string` and `payload: any`
 * If request parameter is an Hapi.Request instance payload is automatically extracted.
 */
export declare const buildLogObject: (msg: string, request?: any) => {
    msg: string;
    payload: any;
};
/**
 * Expose logger anyway, to use indepentently from hapi events
 * @type {Log4js.Logger}
 */
export declare let logger: Log4js.Logger;
/**
 * Plugin register function object
 * @type {logPlugin}
 */
export declare const LogPlugin: HapiPlugin;
