import { Router, Request, Response } from "express"

import ProfileRouter from "./profile.route"
import NotificationRouter from "./notification.route"
import ReceiptRouter from "./receipt.route"

import authMiddleware from "../middleware/auth.middleware"

import controller from "../controllers/user.controller"

const user = Router()

// Middleware
user.use(authMiddleware.authorize())

// Routes
user.use("/profile", ProfileRouter)
user.use("/notifications", NotificationRouter)
user.use("/receipt", ReceiptRouter)

// Endpoints
user.get("/list", (req: Request, res: Response) => {
  controller.getAllUsers(req, res)
})

user.get("/list/active", (req: Request, res: Response) => {
  console.log("TODO")
})

user.put("/edit", (req: Request, res: Response) => {
  controller.editUser(req, res)
})

user.post("/archive", (req: Request, res: Response) => console.log("TODO"))

export default user
