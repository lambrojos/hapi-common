'use strict';
/**
 * @module log
 * Adds log4js integration
 * - every request is logged
 * - intercept api log event originating from server.log and logs them
 *
 * Requires Hapi Config installed
 */
const Log4js = require('log4js');
/**
 * Convience method to structure log with an object containing `msg: string` and `payload: any`
 * If request parameter is an Hapi.Request instance payload is automatically extracted.
 */
exports.buildLogObject = (msg, request) => {
    request = request || {};
    return {
        msg: msg,
        payload: request.payload ? request.payload : request
    };
};
/**
 * Expose logger anyway, to use indepentently from hapi events
 * @type {Log4js.Logger}
 */
exports.logger = null;
/**
 * Plugin register function object
 * @type {logPlugin}
 */
exports.LogPlugin = (server, options, next) => {
    /**
     * Levels supported
     * @type {Array<string>}
     */
    const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    Log4js.configure(options);
    exports.logger = Log4js.getLogger('Time4Sign');
    /**
     * Gets the log level based on tags.
     * If the tags object contains a key with the name  of a logging level (See LEVELS)
     * that string will be returned. Otherwise string passed as defaultLevel will
     * be returned
     *
     * @param  {any}   tags          Hapi tags object
     * @param  {string} defaultLevel If the tag object does not contain a level add this
     * @return {string}              The level for this set of tags
     */
    const getLevel = (tags, defaultLevel) => {
        for (const level of LEVELS) {
            if (tags[level]) {
                return level;
            }
        }
        return defaultLevel;
    };
    /**
     * Logs an entry, at level defaultLevel if tags does not contain a valid level.
     * In that case, that will be the level
     * @param  {string} entry        The logged entry
     * @param  {any}    tags         Log event tags
     * @param  {string} defaultLevel If it is impossible to discern a level from the tags,
     *                               this will be the level
     */
    const logWithLevel = (entry, tags, defaultLevel) => {
        const level = getLevel(tags, defaultLevel);
        switch (level) {
            case 'trace':
                exports.logger.trace(entry);
                break;
            case 'debug':
                exports.logger.debug(entry);
                break;
            case 'info':
                exports.logger.info(entry);
                break;
            case 'warn':
                exports.logger.warn(entry);
                break;
            case 'error':
                exports.logger.error(entry);
                break;
            case 'fatal':
                exports.logger.fatal(entry);
                break;
            default:
                exports.logger.debug(entry);
                break;
        }
    };
    server.on('request-internal', (request, data, tags) => {
        let entry;
        if (tags['received']) {
            entry = `${data.request} - ${data.data.method} ${data.data.url} - ${data.data.agent}`;
        }
        else if (tags['error'] && tags['internal']) {
            entry = `${data.request} - ${data.data.method} ${data.data.url} - ${data.data.stack}`;
        }
        else if (data.data && data.data.output && data.data.output.errorCode) {
            entry = data.data.output.errorCode += ' - ' + entry;
        }
        if (entry) {
            logWithLevel(entry, tags, 'info');
        }
    });
    /**
     * Internal function that parse the log object of type:
     * {msg: 'a text', payload: {somedata:true}}
     * It gracefully handle also a plain string. See documentation.
     */
    const logObjToString = (logObj) => {
        let toLog;
        toLog = logObj.data || logObj;
        let msg = toLog.message || toLog.msg || toLog || '';
        if (toLog.payload && toLog.payload.request) {
            toLog.payload.request = null;
        }
        if (toLog.stack)
            msg += toLog.stack;
        return (toLog.payload) ?
            msg + ' | ' + JSON.stringify(toLog.payload)
            :
                msg;
    };
    server.on('log', (logObj, tags) => {
        if (!logObj) {
            return;
        }
        const toLog = logObjToString(logObj);
        logWithLevel(toLog.toString(), tags, 'info');
    });
    server.on('request', (request, logObj, tags) => {
        if (!logObj) {
            return;
        }
        const req = request.raw.req;
        const entry = ''
            + logObj.request + ' - '
            + request.method + ' - '
            + request.url.pathname + ' - '
            + req.headers['user-agent'] + ' - ';
        const toLog = logObjToString(logObj);
        logWithLevel(entry + ' | ' + toLog.toString(), tags, 'info');
    });
    next();
};
exports.LogPlugin.attributes = {
    name: 'LogPlugin'
};
//# sourceMappingURL=log.js.map