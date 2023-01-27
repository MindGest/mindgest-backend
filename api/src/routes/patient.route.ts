import { Router } from "express"

import controller from "../controllers/patient.controller"

const notification = Router()

// Endpoints
notification.put("/create", controller.create)
notification.get("/list", controller.list)

export default notification
