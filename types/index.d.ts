import { Decorator } from '@render-with/decorators'

export type Params = { [param: string]: string }

export type Routes = { [route: string]: string }

export function withRouter(): Decorator

export function withLocation(path?: string, params?: Params): Decorator

export function withRouting(options?: {
  name?: string,
  path?: string,
  params?: Params,
  routes?: Routes,
  subroutes?: Routes
}): Decorator