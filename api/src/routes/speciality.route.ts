import { Router, Request, Response } from "express"
import controller from "../controllers/speciality.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const speciality = Router()

speciality.get("/list", controller.getAllSpecialities)

speciality.post(
  "/create",
  authMiddleware.authorize(),
  middleware.requestValidator(schemas.SpecialityCreateSchema),
  controller.createSpeciality
)

export default speciality
