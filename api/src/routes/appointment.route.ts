import { Router, Request, Response } from "express"
import controller from "../controllers/appointment.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const appointment = Router()
appointment.use(authMiddleware.authorize())

appointment.post(
  "/list",
  middleware.requestValidator(schemas.AppointmentsListSchema),
  controller.getAllAppointments
)

appointment.post(
  "/list/active",
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

appointment.get("/listLastTerminated", (req: Request, res: Response) => {
  controller.lastTerminatedAppointments(req, res)
})

appointment.get("/listAppointmentsOfTheDayGuard", (req: Request, res: Response) => {
  controller.getAppointmentsOfTheDayGuard(req, res)
})

appointment.get("/listAppointmentsOfTheDayTherapist", (req: Request, res: Response) => {
  controller.getAppointmentsOfTheDayTherapist(req, res)
})

appointment.get("/listAppointmentsOfTheDayIntern", (req: Request, res: Response) => {
  controller.getAppointmentsOfTheDayIntern(req, res)
})

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
