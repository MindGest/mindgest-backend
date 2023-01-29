import { Router, Request, Response } from "express"
import controller from "../controllers/speciality.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const speciality = Router()

speciality.use(authMiddleware.authorize())

speciality.get("/list", (req: Request, res: Response) => {
  controller.getAllSpecialities(req, res)
})

speciality.post(
  "/create",
  middleware.requestValidator(schemas.SpecialityCreateSchema),
  controller.createSpeciality
)

export default speciality
