import { Router, Request, Response } from "express"
import controller from "../controllers/rooms.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

const rooms = Router()

rooms.use(authMiddleware.authorize())

rooms.get("/list", controller.list)
rooms.get("/listAppointmentsRoom", controller.listAppointmentRooms)
rooms.post("/create", middleware.requestValidator(schemas.RoomCreate), controller.create)


export default rooms