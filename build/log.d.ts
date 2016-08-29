import * as Log4js from 'log4js';
import { HapiPlugin } from './typings.d';
export declare const buildLogObject: (msg: string, request?: any) => {
    msg: string;
    payload: any;
};
export declare let logger: Log4js.Logger;
export declare const LogPlugin: HapiPlugin;
