"use strict";
const _log = require('./log');
exports.LogPlugin = _log;
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
    const shutdown = (signal) => {
        server.log(['info', 'shutdown'], 'Received ' + signal + ', gracefully stopping');
        server.root.stop({ timeout: 5000 }, () => {
            server.log(['info', 'shutdown'], 'HTTP server stopped');
            if (options['onServerStop']) {
                options['onServerStop'](server);
            }
        });
    };
    process.on('SIGHUP', () => shutdown('SIGHUP'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGQUIT', () => shutdown('SIGQUIT'));
    process.on('SIGABRT', () => shutdown('SIGABRT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    next();
};
exports.HTTPTweaks.attributes = {
    name: 'Http tweaks'
};
//# sourceMappingURL=http.js.map