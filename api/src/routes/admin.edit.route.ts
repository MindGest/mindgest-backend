import { Router } from "express"

import controller from "../controllers/admin.edit.controller"

import middleware from "../middleware/api.middleware"
import authMiddleware from "../middleware/auth.middleware"

import schemas from "../utils/schemas"

const admin = Router({ mergeParams: true })

// Middleware
admin.use(authMiddleware.authorizeAdmin())

// Endpoints
admin
  .route("/picture")
  .get(
    middleware.requestValidator(schemas.EditProfileParamsSchema),
    controller.downloadUserProfilePicture
  )
  .put(
    middleware.requestValidator(schemas.EditProfileParamsSchema),
    controller.uploadUserProfilePicture
  )

admin
  .route("/info")
  .put(middleware.requestValidator(schemas.EditProfileParamsSchema), controller.editUserProfileInfo)
  .get(
    middleware.requestValidator(schemas.EditProfileParamsSchema),
    controller.fetchUserProfileInfo
  )

admin.put("/approve", controller.approve)

export default admin
