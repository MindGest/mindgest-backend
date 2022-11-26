import { Request, Response } from "express"
import { Router } from "express"

import upload from "../utils/upload"
import controller from "../controllers/profile.controller"

const profile = Router()

// Endpoints

profile.post("/picture", upload, controller.uploadProfilePicture)

profile.get("/picture", controller.downloadProfilePicture)

profile.get("/info", controller.fetchProfileInfo)

profile.put("/edit", (req: Request, res: Response) => console.log("TODO"))

export default profile
