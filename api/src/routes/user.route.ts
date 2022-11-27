import { Router } from "express"

import ProfileRouter from "./profile.route"
import NotificationRouter from "./notification.route"
import ReceiptRouter from "./receipt.route"
import PermissionRouter from "./permission.route"

import authMiddleware from "../middleware/auth.middleware"

import controller from "../controllers/user.controller"

const user = Router()

// Middleware
user.use(authMiddleware.authorize())

// Routes
user.use("/profile", ProfileRouter)
user.use("/notifications", NotificationRouter)
user.use("/receipt", ReceiptRouter)
user.use("/permissions", PermissionRouter)

// Endpoints
user.get("/list", controller.getUsers)

// ? IMPROVEMENT: Maybe this should get its own router
user.put("/:user/edit", controller.editUser)

// ? IMPROVEMENT: Update not only the info but also the profile picture of another user?

export default user
