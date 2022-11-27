import { Router } from "express"

import AuthRouter from "./auth.route"
import UserRouter from "./user.route"
import DocsRouter from "./docs.route"
import ProcessRouter from "./process.route"
import AppointmentRouter from "./appointment.route"

import controller from "../controllers/api.controller"

// Util
;(BigInt.prototype as any).toJSON = function () {
  return Number(this.toString())
}

// Mindgest API Router
const api = Router()

// Routes
api.use("/auth", AuthRouter)
api.use("/user", UserRouter)
api.use("/docs", DocsRouter)
api.use("/process", ProcessRouter)
api.use("/appointment", AppointmentRouter)

// Healthcheck
api.get("/healthcheck", controller.healthCheck)

export default api
