import { Router } from "express"

import controller from "../controllers/patient.controller"
import authMiddleware from "../middleware/auth.middleware"

const patient = Router()

patient.use(authMiddleware.authorize())

// Endpoints
patient.put("/create", controller.create)
patient.get("/list", controller.list)

export default patient
