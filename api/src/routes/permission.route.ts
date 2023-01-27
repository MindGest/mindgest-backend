import { Router, Request, Response } from "express"
import controller from "../controllers/permissions.controller"
import authMiddleware from "../middleware/auth.middleware"

const permission = Router()
permission.use(authMiddleware.authorize())

permission.post("/get-interns-permissions", (req: Request, res: Response) => {
    controller.getInternsPermissions(req, res)
})

permission.put("/edit-intern-permissions", (req: Request, res: Response) => {
    controller.editInternPermissions(req, res)
})

export default permission
