import { Router } from "express"

import bodyParser from "body-parser"
import cookieParser from "cookie-parser"

import schemas from "../utils/schemas"
import controller from "../controllers/auth.controller"
import middleware from "../middleware/api.middleware"

const COOKIE_SECRET = String(process.env.COOKIE_SECRET)

const auth = Router()

// Middleware
auth.use(cookieParser(COOKIE_SECRET))

// Enpoints
auth.post("/register", middleware.requestValidator(schemas.RegistrationSchema), controller.register)

auth.post("/login", middleware.requestValidator(schemas.LoginSchema), controller.login)

auth.post("/refresh", middleware.requestValidator(schemas.RefreshSchema), controller.refresh)

auth.post(
  "/verify-account",
  middleware.requestValidator(schemas.VerifyAccountSchema),
  controller.verify
)

auth.post(
  "/account-verification",
  middleware.requestValidator(schemas.AccountVerificationSchema),
  controller.accountVerification
)

auth.post(
  "/forgot-password",
  middleware.requestValidator(schemas.ForgotPasswordSchema),
  controller.forgotPassword
)

auth.post(
  "/reset-password",
  middleware.requestValidator(schemas.ResetPasswordSchema),
  controller.resetPassword
)

export default auth
