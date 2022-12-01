import { Request, Response } from "express"
import { Router } from "express"

import controller from "../controllers/profile.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const profile = Router()

// Endpoints
profile
  .route("/picture")
  .put(controller.uploadProfilePicture)
  .get(controller.downloadProfilePicture)

profile
  .route("/info")
  .put(middleware.requestValidator(schemas.SelfEditProfileSchema), controller.editProfileInfo)
  .get(controller.fetchProfileInfo)

export default profile
