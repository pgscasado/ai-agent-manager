import { RequestHandler as rh } from 'express'

export type RequestHandler<Body = any, Params = any, Query = any> = rh<Params, any, Body, Query>