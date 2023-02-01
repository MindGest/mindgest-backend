import { Router, Request, Response } from "express"
import controller from "../controllers/liable.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const liable = Router()

liable.use(authMiddleware.authorize())

liable.get("/list", controller.listLiables)

liable.get("/:liableId/info", controller.infoLiable)

liable.post(
  "/create",
  middleware.requestValidator(schemas.CreateLiableSchema),
  controller.createLiable
)

export default liable