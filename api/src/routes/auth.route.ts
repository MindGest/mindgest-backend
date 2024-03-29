import { Router } from "express"

import schemas from "../utils/schemas"
import controller from "../controllers/auth.controller"
import middleware from "../middleware/api.middleware"

const auth = Router()

// Endpoints
auth.post("/register", middleware.requestValidator(schemas.RegistrationSchema), controller.register)

auth.post("/login", middleware.requestValidator(schemas.LoginSchema), controller.login)

auth.post("/refresh", middleware.requestValidator(schemas.RefreshSchema), controller.refresh)

auth.post(
  "/verify-account",
  middleware.requestValidator(schemas.VerifyAccountSchema),
  controller.verify
)

auth.post(
  "/reset-password",
  middleware.requestValidator(schemas.ResetPasswordSchema),
  controller.resetPassword
)

export default auth
