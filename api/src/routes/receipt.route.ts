import { Router, Request, Response } from "express"
import controller from "../controllers/receipt.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

const receipt = Router()

receipt.use(authMiddleware.authorize())

receipt.get("/list", controller.list)

receipt.get("/info/:receiptId", controller.info)

receipt.post("/create/:appointmentId", controller.create)

receipt.put("/pay/:receiptId", controller.pay)

export default receipt
