import { Router } from "express"

import ProfileRouter from "./profile.route"
import NotificationRouter from "./notification.route"
import AdminEditRouter from "./admin.edit.route"

import authMiddleware from "../middleware/auth.middleware"

import controller from "../controllers/user.controller"

const user = Router()

// Middleware
user.use(authMiddleware.authorize())

// Routes
user.use("/profile", ProfileRouter)
user.use("/:user/profile", AdminEditRouter)
user.use("/notifications", NotificationRouter)

// Endpoints
user.get("/list", controller.getUsers)

export default user
