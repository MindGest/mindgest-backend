import { Router } from "express"

import cookieParser from "cookie-parser"

import schemas from "../utils/schemas"
import controller from "../controllers/email.controller"

import middleware from "../middleware/api.middleware"
import authMiddleware from "../middleware/auth.middleware"

const email = Router()

// Endpoints
email.post(
  "/account-verification",
  middleware.requestValidator(schemas.AccountVerificationSchema),
  controller.accountVerificationEmail
)

email.post(
  "/forgot-password",
  middleware.requestValidator(schemas.ForgotPasswordSchema),
  controller.forgotPasswordEmail
)

email.post(
  "/send",
  authMiddleware.authorize(),
  middleware.requestValidator(schemas.EmailSchema),
  controller.sendGenericEmail
)

export default email
