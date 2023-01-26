import { Router, Request, Response } from "express"
import controller from "../controllers/appointment.controller"
import authMiddleware from "../middleware/auth.middleware"

const appointment = Router()
appointment.use(authMiddleware.authorize())

appointment.post("/list", (req: Request, res: Response) => {
  controller.getAllAppointments(req, res)
})

appointment.post("/list/active", (req: Request, res: Response) => {
  controller.getAllActiveAppointments(req, res)
})

appointment.post("/info", (req: Request, res: Response) => {
  controller.infoAppointment(req, res)
})

appointment.post("/create", (req: Request, res: Response) => {
  controller.createAppointment(req, res)
})

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

appointment.put("/archive", (req: Request, res: Response) => {
  controller.archiveAppointment(req, res)
})

appointment.put("/edit", (req: Request, res: Response) => {
  controller.editAppointment(req, res)
})

export default appointment
