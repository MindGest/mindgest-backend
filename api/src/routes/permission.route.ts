import { Router, Request, Response } from "express"
import controller from "../controllers/permissions.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const permission = Router()
permission.use(authMiddleware.authorize())

permission.post(
  "/get-interns-permissions",
  middleware.requestValidator(schemas.GetPermissionsSchema),
  controller.getInternsPermissions
)

permission.put(
  "/edit-intern-permissions",
  middleware.requestValidator(schemas.EditPermissionsSchema),
  controller.editInternPermissions
)

permission.post(
  "/get-intern-permissions",
  middleware.requestValidator(schemas.GetPermissionsSchema),
  controller.getInternPermissions
)

export default permission
