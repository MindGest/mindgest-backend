import type { Request, Response, NextFunction } from "express"
import { StatusCodes } from "http-status-codes"

import { verifyAccessToken } from "../services/auth.service"
import { AccessToken } from "../utils/types"

export function authorize() {
  return (req: Request, res: Response, next: NextFunction) => {
    const accessToken = (req.headers.authorization || "").replace(/Bearer\s/, "")
    if (!accessToken) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Access token was not provided",
      })
    }
    const decoded = verifyAccessToken<AccessToken>(accessToken)
    if (decoded) {
      res.locals.token = decoded
      return next()
    }
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Invalid/Expired Access Token. Permission Denied",
    })
  }
}

export function authorizeRoles(...roles: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(res.locals.token)) {
      res.sendStatus(StatusCodes.UNAUTHORIZED)
    }
    next()
  }
}

export default { authorize }
