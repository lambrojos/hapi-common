// needs many many more tests. will be added when stuff gets broken or modified
"use strict";
const Hapi = require('hapi');
const sinon_1 = require('sinon');
const index_1 = require('../index');
const assert = require('assert');
let srv = null;
let logSpy = null;
const layout = {
    pattern: '%d{yyyy MM dd hh:mm:ss.SSS} | %-5p |%m%n |  ',
    type: 'pattern',
};
describe('The Log plugin', () => {
    before((done) => {
        srv = new Hapi.Server();
        const logConf = {
            appenders: [
                { layout: layout, pattern: 'yyyy-MM-dd', type: 'console' },
            ]
        };
        srv.register({
            options: logConf,
            register: index_1.Log.LogPlugin
        }, () => {
            logSpy = sinon_1.spy(index_1.Log.logger, 'info');
            srv.log(['info'], 'aiuto');
            done();
        });
    });
    it('registers a log4js instance and logs messages', function () {
        assert(logSpy.args[0][0] === 'aiuto');
    });
});
//# sourceMappingURL=test.js.map