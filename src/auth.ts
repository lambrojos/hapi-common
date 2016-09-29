import {HapiPlugin} from '../typings/typings.d'
import {Transaction, QueryBuilder} from 'knex'
import * as Promise from 'bluebird'
import { v4 as uuid } from 'uuid'
import * as JWT from 'jsonwebtoken'
import {Server, Request} from 'hapi'
import {returnType} from './http'
import {SchemaMap, object} from 'joi'
import * as hapiAuthJWT from 'hapi-auth-jwt2'

/**
 * Two kinds of session are supported.
 * Login sessions cannot be parallel.
 * One user can instead have multiple active onetime logins
 */
export const enum SESSION_TYPE {
  login = 0,
  onetime = 1
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000
const SESSION_GC_INTERVAL = 60 * 60 * 1000

/**
 * Let's try to be db agnostic. We define DAOs just as a type
 * Todo - put those cool f-bounded params in DAO library
 */
type DAOFn<T> = (params: T | {}, tx?) => QueryBuilder

type DAO<T> = {
  del: DAOFn<T>
  create: DAOFn<T>,
  count: Function // to complete
  findOne: DAOFn<T>
  schema: SchemaMap
}

type User = {
  [s: string]: any,
  id?: number
}

type Session = {
  id?: string
  user_id?: number,
  exp?: number,
  type?: SESSION_TYPE
}

let userDAO: DAO<User>  = null
let sessionDAO: DAO<Session> = null
let secret: string = null


/**
 * Creates a session token for a user
 * @type {[type]}
 */
export const createSession = (
  user: User,
  sessionType: SESSION_TYPE,
  tx?: Transaction,
  duration?: number,
  additionalPayload?: any
): Promise<string> =>

  (
    sessionType === SESSION_TYPE.login ?
    sessionDAO.del({user_id: user.id}, tx) : Promise.resolve()
  )

  .then( () => sessionDAO.create({
      exp: duration || new Date().getTime() + SESSION_DURATION,
      id: uuid(),
      user_id: user.id,
      type: sessionType
  }, tx))

  .then( session => {

    const a = JWT.sign(
      Object.assign(session, additionalPayload),
      secret
    )
    return a;
  })



/**
 * Deletes expired sessions, where the exp claim contains a past timestamp
 */
export const sessionGC = (server: Server) =>

  sessionDAO.del({})
  .where('exp', '<', new Date().getTime())
  .then( nDeleted =>
    server.log(
      ['info', 'GC'],
      'Session GC has run,' + nDeleted + ' expired sessions removed'
    )
  )

/**
 * Very simple session validator, just checks that a session record exists and is not expired,
 * Session.find() ensures that the expiration date is not in the past
 */
export const validateSession = (decoded: any, request: Request, cb: any) =>

  sessionDAO
  .count({ where: {id: decoded.id}})
  .andWhere('exp', '>', new Date().getTime())
  .then(result => cb(null, result[0].count > 0))
  .catch(cb)


export const JWTAuth: HapiPlugin = (server, options, next) => {

  userDAO = options['userDAO']
  sessionDAO = options['sessionDAO']
  setInterval(() => { sessionGC(server) }, SESSION_GC_INTERVAL)

  const config = server.plugins['hapi-config'].CurrentConfiguration

  server.register(hapiAuthJWT, (err) => {

    if (err) { return next(err) }

    secret = config.get('JWT_SECRET')

    server.auth.strategy('jwt', 'jwt', true, {
      key: config.get('JWT_SECRET'),
      validateFunc: validateSession,
      verifyOptions: { algorithms: [ 'HS256' ] }
    })
  })

  server.route({
    config: {
      description: 'Gets the current user',
      notes: `Gets current user data. A good way to check if a token is still valid.`,
      tags: ['api'],
      plugins: returnType(object(sessionDAO.schema).label('User')),
    },
    handler:  (request, reply) => {
      userDAO.findOne({id: request.auth.credentials.user_id}).then(reply)
    },
    method: 'GET',
    path: '/me'
  })

  next()
}

JWTAuth.attributes = {
  name: 'Validsign authentication plugin'
}
