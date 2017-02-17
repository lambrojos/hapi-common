"use strict";
const Promise = require("bluebird");
const uuid_1 = require("uuid");
const JWT = require("jsonwebtoken");
const hapiAuthJWT = require("hapi-auth-jwt2");
var SESSION_TYPE;
(function (SESSION_TYPE) {
    SESSION_TYPE[SESSION_TYPE["login"] = 0] = "login";
    SESSION_TYPE[SESSION_TYPE["onetime"] = 1] = "onetime";
})(SESSION_TYPE = exports.SESSION_TYPE || (exports.SESSION_TYPE = {}));
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const SESSION_GC_INTERVAL = 60 * 60 * 1000;
let userDAO = null;
let sessionDAO = null;
let secret = null;
exports.createSession = (user, sessionType, tx, duration, additionalPayload) => (sessionType === 0 ?
    sessionDAO.del({ user_id: user.id, type: 0 }, tx) : Promise.resolve())
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
        server.auth.strategy('jwt', 'jwt', false, {
            key: config.get('JWT_SECRET'),
            validateFunc: exports.validateSession,
            verifyOptions: { algorithms: ['HS256'] },
            errorFunc: () => { },
        });
    });
    next();
};
exports.JWTAuth.attributes = {
    name: 'Validsign authentication plugin'
};
//# sourceMappingURL=auth.js.map