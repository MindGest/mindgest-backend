import { Router } from "express"

import AuthRouter from "./auth.route"
import UserRouter from "./user.route"
import DocsRouter from "./docs.route"
import ProcessRouter from "./process.route"
import { StatusCodes } from "http-status-codes"

// Mindgest API Router
const api = Router()

// Routes
api.use("/auth", AuthRouter)
api.use("/user", UserRouter)
api.use("/docs", DocsRouter)
api.use("/process", ProcessRouter)

// Healthcheck
api.get("/healthcheck", (_, res) => {
  res.status(StatusCodes.OK).send({
    uptime: process.uptime(),
    message: "Healthy",
    date: new Date(),
  })
})

export default api
