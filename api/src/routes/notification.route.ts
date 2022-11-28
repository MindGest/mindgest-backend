import { Request, Response } from "express"
import { Router } from "express"

import controller from "../controllers/notification.controller"

const notification = Router()

// Endpoints
notification.put("/mark/:notification", controller.mark)
notification.get("/list", controller.list)

export default notification
