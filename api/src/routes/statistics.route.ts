import { Router, Request, Response } from "express"
import controller from "../controllers/statistics.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

const statistics = Router()

statistics.use(authMiddleware.authorize())

statistics.post("/", controller.statistics)

export default statistics
