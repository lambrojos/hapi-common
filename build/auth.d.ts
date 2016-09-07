import { HapiPlugin } from '../typings/typings.d';
import { Transaction } from 'knex';
import * as Promise from 'bluebird';
import { Server, Request } from 'hapi';
/**
 * Two kinds of session are supported.
 * Login sessions cannot be parallel.
 * One user can instead have multiple active onetime logins
 */
export declare const enum SESSION_TYPE {
    login = 0,
    onetime = 0,
}
/**
 * Creates a session token for a user
 * @type {[type]}
 */
export declare const createSession: (user: {
    [s: string]: any;
    id?: number;
}, sessionType: SESSION_TYPE, tx?: Transaction, duration?: number, additionalPayload?: any) => Promise<string>;
/**
 * Deletes expired sessions, where the exp claim contains a past timestamp
 */
export declare const sessionGC: (server: Server) => Promise<void>;
/**
 * Very simple session validator, just checks that a session record exists and is not expired,
 * Session.find() ensures that the expiration date is not in the past
 */
export declare const validateSession: (decoded: any, request: Request, cb: any) => any;
export declare const JWTAuth: HapiPlugin;
