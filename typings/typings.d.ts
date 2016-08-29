import * as Hapi from 'hapi'

export type HapiPlugin = {
  (server: Hapi.Server, options: {[s: string]: any}, next: Function): void; attributes?: any
}
