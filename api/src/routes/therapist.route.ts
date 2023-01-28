import { Router, Request, Response } from "express"
import controller from "../controllers/therapist.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

const therapist = Router()

therapist.use(authMiddleware.authorize())

therapist.get("/listPatients", controller.listPatients)

therapist.get("/list", controller.list)

export default therapist
