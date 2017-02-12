"use strict";
const Promise = require('bluebird');
const uuid_1 = require('uuid');
const JWT = require('jsonwebtoken');
const hapiAuthJWT = require('hapi-auth-jwt2');
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const SESSION_GC_INTERVAL = 60 * 60 * 1000;
let userDAO = null;
let sessionDAO = null;
let secret = null;
/**
 * Creates a session token for a user
 * @type {[type]}
 */
exports.createSession = (user, sessionType, tx, duration, additionalPayload) => (sessionType === 0 /* login */ ?
    sessionDAO.del({ user_id: user.id, type: 0 /* login */ }, tx) : Promise.resolve())
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
/**
 * Deletes expired sessions, where the exp claim contains a past timestamp
 */
exports.sessionGC = (server) => sessionDAO.del({})
    .where('exp', '<', new Date().getTime())
    .then(nDeleted => server.log(['info', 'GC'], 'Session GC has run,' + nDeleted + ' expired sessions removed'));
/**
 * Very simple session validator, just checks that a session record exists and is not expired,
 * Session.find() ensures that the expiration date is not in the past
 */
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
    next();
};
exports.JWTAuth.attributes = {
    name: 'Validsign authentication plugin'
};
//# sourceMappingURL=auth.js.map