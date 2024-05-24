import { RequestHandler } from 'express';
import { ZodSchema, z } from "zod";

export const validate: (schemas: ({ body?: ZodSchema, query?: ZodSchema, params?: ZodSchema })) => RequestHandler = (schemas) => 
  async (req, res, next) => {
    try {
      const schema = z.object({
        body:  schemas.body ?? z.any(),
        query: schemas.query ?? z.any(),
        params: schemas.params ?? z.any(), 
      });
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = result.body
      req.query = result.query
      req.params = result.params
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  }