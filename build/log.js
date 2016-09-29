'use strict';
const Log4js = require('log4js');
exports.buildLogObject = (msg, request) => {
    request = request || {};
    return {
        msg: msg,
        payload: request.payload ? request.payload : request
    };
};
exports.logger = null;
exports.LogPlugin = (server, options, next) => {
    const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    Log4js.configure(options);
    exports.logger = Log4js.getLogger('Time4Sign');
    const getLevel = (tags, defaultLevel) => {
        for (const level of LEVELS) {
            if (tags[level]) {
                return level;
            }
        }
        return defaultLevel;
    };
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