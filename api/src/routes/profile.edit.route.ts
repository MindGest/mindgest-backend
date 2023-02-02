import { Router } from "express"

import controller from "../controllers/profile.controller"

import authMiddleware from "../middleware/auth.middleware"
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
  .put(middleware.requestValidator(schemas.EditProfileSchema), controller.editProfileInfo)
  .get(controller.fetchProfileInfo)

profile.put("/switch-view", authMiddleware.authorizeAdmin(), controller.switchView)

export default profile
