import { Router, Request, Response } from "express"
import controller from "../controllers/receipt.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

const receipt = Router()

receipt.use(authMiddleware.authorize())

receipt.get("/list", controller.list)

receipt.post("/create", controller.create)

receipt.put("/pay/:receiptId", (req: Request, res: Response) => console.log("TODO"))

export default receipt
