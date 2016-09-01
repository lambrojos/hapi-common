// needs many many more tests. will be added when stuff gets broken or modified

import * as Hapi from 'hapi'
import {spy} from 'sinon'
import {Log} from '../index'
import * as assert from 'assert'

let srv = null
let logSpy = null

const layout = {
  pattern: '%d{yyyy MM dd hh:mm:ss.SSS} | %-5p |%m%n |  ',
  type: 'pattern',
}

describe('The Log plugin', () => {

  before( (done) => {
    srv = new Hapi.Server()
    const logConf: { appenders: Array<any> } = {
      appenders: [
        { layout: layout,  pattern: 'yyyy-MM-dd', type: 'console' },
      ]
    }
    srv.register({
      options: logConf,
      register: Log.LogPlugin
    }, () => {
      logSpy = spy(Log.logger, 'info')
      srv.log(['info'], 'aiuto')
      done()
    })
  })

  it('registers a log4js instance and logs messages', function(){
    assert(logSpy.args[0][0] === 'aiuto')
  })

})
