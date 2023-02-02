import { Router } from "express"

import controller from "../controllers/notification.controller"

import middleware from "../middleware/api.middleware"
import authMiddleware from "../middleware/auth.middleware"
import schemas from "../utils/schemas"
const notification = Router()

// Endpoints

notification.use(authMiddleware.authorize())

notification.get("/list", controller.list)

notification.get("/:id/info", controller.info)
notification.put("/:id/mark", controller.mark)
notification.put("/:id/settle", controller.settle)

notification.post(
  "/create",
  middleware.requestValidator(schemas.NotificationSchema),
  controller.create
)

export default notification
