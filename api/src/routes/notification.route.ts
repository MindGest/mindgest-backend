import cookieParser from "cookie-parser"
import { Router } from "express"

import controller from "../controllers/notification.controller"

import middleware from "../middleware/api.middleware"
import authMiddleware from "../middleware/auth.middleware"
import schemas from "../utils/schemas"

const notification = Router()

// Middleware
notification.use(authMiddleware.authorize())

// Endpoints
notification.put("/mark/:id", controller.mark)
notification.get("/list", controller.list)
notification.get(
  "/create",
  middleware.requestValidator(schemas.NotificationSchema),
  controller.create
)

export default notification
