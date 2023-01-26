import { AnyZodObject, ZodError } from "zod"
import { StatusCodes } from "http-status-codes"
import compression from "compression"

import type { NextFunction, Request, Response } from "express"

export function requestValidator(schema: AnyZodObject) {
  return (req: Request<any, any, any>, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      })
    } catch (error) {
      console.log(error)
      if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Malformed Request",
          payload: error,
        })
      }
    }
    next()
  }
}

export function bodyParserErrorValidator() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Malformed Request",
        payload: { type: err.name, info: err.message },
      })
    }
    next()
  }
}

export function notFound(req: Request, res: Response) {
  res.status(StatusCodes.NOT_FOUND).json({
    message: "Endpoint not found or wrong HTTP method used!",
  })
}

export function shouldCompress(req: Request, res: Response) {
  return req.headers["x-no-compression"] ? false : compression.filter(req, res)
}

export default {
  requestValidator,
  bodyParserErrorValidator,
  notFound,
  shouldCompress,
}
