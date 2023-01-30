import { Router, Request, Response } from "express"
import controller from "../controllers/receipt.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

const receipt = Router()

receipt.use(authMiddleware.authorize())

receipt.get("/list", controller.list)

receipt.get("/:processId/list", controller.listProcess)

receipt.get("/:receiptId/info", controller.info)

receipt.post("/:appointmentId/create", controller.create)

receipt.put("/:receiptId/pay", controller.pay)

export default receipt
