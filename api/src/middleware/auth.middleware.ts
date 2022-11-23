import type { Request, Response, NextFunction } from "express"

import { verifyAccessToken } from "../services/auth.service"
import { AccessToken } from "../utils/types"

export default function fetchUser(req: Request, res: Response, next: NextFunction) {
  const accessToken = (req.headers.authorization || "").replace(/Bearer\s/, "")

  if (!accessToken) return next()

  const decoded = verifyAccessToken<AccessToken>(accessToken)

  if (decoded) {
    res.locals.user = decoded
  }

  return next()
}
