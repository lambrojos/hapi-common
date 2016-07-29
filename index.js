"use strict";
const _log = require('./log');
exports.LogPlugin = _log;
/**
 * Shorthand for hapi-swagger return objects
 * @type {[type]}
 */
exports.returnType = (schema) => {
    return {
        'hapi-swagger': {
            responses: {
                '200': {
                    'schema': schema
                }
            }
        }
    };
};
exports.HTTPTweaks = (server, options, next) => {
    server.ext('onPreResponse', (request, reply) => {
        const res = request.response;
        if (res.isBoom) {
            const output = res['output'];
            if (output.statusCode === 400) {
                if (!output.payload.errorCode) {
                    const e = Boom.badRequest(res['output'].payload.message);
                    e.output.payload['errorCode'] = 'ERR_VALIDATION';
                    return reply(e);
                }
            }
            if (output.statusCode === 401) {
                request.log(['error', 'authentication'], output.payload.message || output.payload.error, output);
                if (!output.payload.errorCode) {
                    const e = Boom.unauthorized(output.payload.message);
                    e.output.payload['errorCode'] = 'ERR_INVALID_JWT';
                    return reply(e);
                }
            }
            request.log(['error'], output.payload.message || output.payload.error, output);
            return reply.continue();
        }
        return reply.continue();
    });
    /**
     * Normalizes empty string, to undefined in payload
     * objects and arrays. This is for simplifying
     * @param  {[type]} 'onRequest'    [description]
     * @param  {[type]} (request,reply [description]
     * @return {[type]}                [description]
     */
    const deleteEmpty = (payload) => {
        if (typeof payload !== 'object' || payload === null) {
            return;
        }
        for (const k of Object.keys(payload)) {
            if (payload[k] === '') {
                payload[k] = null;
            }
        }
    };
    /**
     * Applies the delete empty function to all incoming payloads
     */
    server.ext('onPostAuth', (request, reply) => {
        if (Array.isArray(request.payload)) {
            for (const obj of request.payload) {
                deleteEmpty(obj);
            }
        }
        else {
            deleteEmpty(request.payload);
        }
        reply.continue();
    });
};
//# sourceMappingURL=index.js.map