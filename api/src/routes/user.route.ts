import { Router, Request, Response } from "express"

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

user.get("/get-all-therapists", (req: Request, res: Response) => {
    controller.getAllTherapists(req, res)
})

user.get("/get-all-interns", (req: Request, res: Response) => {
    controller.getAllInterns(req, res)
})

export default user
