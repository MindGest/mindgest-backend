import type { Request, Response, NextFunction } from "express"
import { StatusCodes } from "http-status-codes"

import { verifyAccessToken } from "../services/auth.service"
import { User } from "../utils/schemas"
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

export function authorizeAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    const { id, role, admin } = res.locals.token
    if (!admin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          "Permission Denied. This operation can only be performed by a user with admin privileges",
      })
    }
    return next()
  }
}

export default { authorize, authorizeAdmin }
