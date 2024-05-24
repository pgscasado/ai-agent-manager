import snake from 'snakecase-keys';
import camel from 'camelcase-keys';
import { CamelCasedPropertiesDeep, SnakeCasedPropertiesDeep } from 'type-fest'
import { RequestHandler } from 'express';
import { ZodEffects, ZodObject, z } from 'zod';

export const zodSnakeToCamelcase = <T extends z.ZodObject<any, 'strip'>>(zod: T) => 
  z.object(camelcase(zod.shape, { deep: false }));

export const zodCamelToSnakecase = <T extends z.ZodObject<any, 'strip'>>(zod: T) => 
  z.object(snakecase(zod.shape) as unknown as SnakeCasedPropertiesDeep<T['shape']>) as unknown as ZodEffects<z.ZodTypeAny, SnakeCasedPropertiesDeep<T['shape']>>;

/**
 * @author kuroski
 * @see https://gist.github.com/kuroski/9a7ae8e5e5c9e22985364d1ddbf3389d
 */ 
type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}` ?
  `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}` : Lowercase<S>

type KeysToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K]
}

export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}` ?
  `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}` : S

type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K]
}
/************************************************************* */
type snakeCaseFunctionOptionArg = {
  deep?: boolean,
  exclude?: (string | RegExp)[]
}
export const snakecase = <T extends Record<string, any> | ZodObject<any, 'strip'>>(input: T, {deep = true, exclude = []}: snakeCaseFunctionOptionArg = {}) => {
  return snake(input, { deep, exclude }) as KeysToSnakeCase<T>;
}

export const camelcase = <T extends Record<string, any> | ZodObject<any, 'strip'>>(input: T, {deep = true, exclude = []}: snakeCaseFunctionOptionArg = {}) => {
  return camel(input as any, { deep, exclude }) as KeysToCamelCase<T>;
}

export const camelcaseMiddleware: RequestHandler = (req, res, next) => {
  req.body = camelcase(req.body);
  req.params = camelcase(req.params);
  req.query = camelcase(req.query);
  next();
}

export const snakecaseString = (str: string) => {
  return str.replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
};

export const transformSnakeCaseMiddleware: RequestHandler = (_, res, next) => {
  const json = res.json;
  res.json = (body) => {
    if (res.statusCode !== 500 && body && typeof body === 'object') {
      const snake = snakecase(body, {
        exclude: ['_id']
      });
      return json.call(res, snake);
    }
    return json.call(res, body);
  }
  next();
}