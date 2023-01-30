import cookieParser from "cookie-parser"
import { Router } from "express"

import controller from "../controllers/notification.controller"

import middleware from "../middleware/api.middleware"
import authMiddleware from "../middleware/auth.middleware"
import schemas from "../utils/schemas"

const notification = Router()

// Endpoints
notification.post("/mark/:id", controller.mark)
notification.put("/settle/:id", controller.settle)

notification.get("/list", controller.list)
notification.post(
  "/create",
  middleware.requestValidator(schemas.NotificationSchema),
  controller.create
)

export default notification
