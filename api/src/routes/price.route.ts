import { Router, Request, Response } from "express"
import controller from "../controllers/price.controller"
import authMiddleware from "../middleware/auth.middleware"

const price = Router()

price.use(authMiddleware.authorize())

price.get("/list", controller.listPrices)

export default price
