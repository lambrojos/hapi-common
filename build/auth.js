"use strict";
const Promise = require('bluebird');
const uuid_1 = require('uuid');
const JWT = require('jsonwebtoken');
const http_1 = require('./http');
const joi_1 = require('joi');
const hapiAuthJWT = require('hapi-auth-jwt2');
(function (SESSION_TYPE) {
    SESSION_TYPE[SESSION_TYPE["login"] = 0] = "login";
    SESSION_TYPE[SESSION_TYPE["onetime"] = 1] = "onetime";
})(exports.SESSION_TYPE || (exports.SESSION_TYPE = {}));
var SESSION_TYPE = exports.SESSION_TYPE;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const SESSION_GC_INTERVAL = 60 * 60 * 1000;
let userDAO = null;
let sessionDAO = null;
let secret = null;
exports.createSession = (user, sessionType, tx, duration, additionalPayload) => (sessionType === 0 ?
    sessionDAO.del({ user_id: user.id }, tx) : Promise.resolve())
    .then(() => sessionDAO.create({
    exp: duration || new Date().getTime() + SESSION_DURATION,
    id: uuid_1.v4(),
    user_id: user.id,
    type: sessionType
}, tx))
    .then(session => {
    const a = JWT.sign(Object.assign(session, additionalPayload), secret);
    return a;
});
exports.sessionGC = (server) => sessionDAO.del({})
    .where('exp', '<', new Date().getTime())
    .then(nDeleted => server.log(['info', 'GC'], 'Session GC has run,' + nDeleted + ' expired sessions removed'));
exports.validateSession = (decoded, request, cb) => sessionDAO
    .count({ where: { id: decoded.id } })
    .andWhere('exp', '>', new Date().getTime())
    .then(result => cb(null, result[0].count > 0))
    .catch(cb);
exports.JWTAuth = (server, options, next) => {
    userDAO = options['userDAO'];
    sessionDAO = options['sessionDAO'];
    setInterval(() => { exports.sessionGC(server); }, SESSION_GC_INTERVAL);
    const config = server.plugins['hapi-config'].CurrentConfiguration;
    server.register(hapiAuthJWT, (err) => {
        if (err) {
            return next(err);
        }
        secret = config.get('JWT_SECRET');
        server.auth.strategy('jwt', 'jwt', true, {
            key: config.get('JWT_SECRET'),
            validateFunc: exports.validateSession,
            verifyOptions: { algorithms: ['HS256'] }
        });
    });
    server.route({
        config: {
            description: 'Gets the current user',
            notes: `Gets current user data. A good way to check if a token is still valid.`,
            tags: ['api'],
            plugins: http_1.returnType(joi_1.object(sessionDAO.schema).label('User')),
        },
        handler: (request, reply) => {
            userDAO.findOne({ id: request.auth.credentials.user_id }).then(reply);
        },
        method: 'GET',
        path: '/me'
    });
    next();
};
exports.JWTAuth.attributes = {
    name: 'Validsign authentication plugin'
};
//# sourceMappingURL=auth.js.map