import { Router, Request, Response } from "express"
import controller from "../controllers/appointment.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"
import cookieParser from "cookie-parser"

const COOKIE_SECRET = String(process.env.COOKIE_SECRET)

const appointment = Router()

// Middleware
appointment.use(cookieParser(COOKIE_SECRET))
appointment.use(authMiddleware.authorize())

appointment.post(
  "/list",
  middleware.requestValidator(schemas.AppointmentsListSchema),
  controller.getAllAppointments
)

appointment.post(
  "/list-active",
  middleware.requestValidator(schemas.AppointmentsListSchema),
  controller.getAllActiveAppointments
)

appointment.post(
  "/info",
  middleware.requestValidator(schemas.AppointmentInfoSchema),
  controller.infoAppointment
)

appointment.post(
  "/create",
  middleware.requestValidator(schemas.AppointmentCreateSchema),
  controller.createAppointment
)

appointment.get("/last-terminated", (req: Request, res: Response) => {
  controller.lastTerminatedAppointments(req, res)
})

appointment.get("/list-appointments-of-the-day", controller.listAppointmentsOfTheDay)

appointment.get("/ongoing", controller.onGoingAppointments)

appointment.put(
  "/archive",
  middleware.requestValidator(schemas.AppointmentArchiveSchema),
  controller.archiveAppointment
)

appointment.put(
  "/edit",
  middleware.requestValidator(schemas.AppointmentEditSchema),
  controller.editAppointment
)

export default appointment
