import { Router } from "express"

import AuthRouter from "./auth.route"
import UserRouter from "./user.route"
import DocsRouter from "./docs.route"

// Mindgest API Router
const api = Router()

// Routes
api.use("/auth", AuthRouter)
api.use("/user", UserRouter)
api.use("/docs", DocsRouter)

export default api
