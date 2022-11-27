import { Request, Response } from "express"
import { Router } from "express"

import upload from "../utils/upload"
import controller from "../controllers/profile.controller"

const profile = Router()

// Endpoints
profile
  .route("/picture")
  .post(upload, controller.uploadProfilePicture)
  .get(controller.downloadProfilePicture)

profile.get("/info", controller.fetchProfileInfo)

profile.put("/edit", controller.editProfileInfo)

export default profile
