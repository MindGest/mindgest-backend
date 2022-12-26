import { Router, Request, Response } from "express"
import controller from "../controllers/speciality.controller"

const speciality = Router()

speciality.get("/list", (req: Request, res: Response) => {
    controller.getAllSpecialities(req, res)
})

speciality.post("/create", (req: Request, res: Response) => {
    controller.createSpeciality(req, res)
})


export default speciality