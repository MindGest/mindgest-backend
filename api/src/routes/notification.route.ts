import { Request, Response } from "express"
import { Router } from "express"

const notification = Router()

notification.put("/mark", (req: Request, res: Response) => console.log("TODO"))

notification.get("/list", (req: Request, res: Response) => console.log("TODO"))

notification.get("/list-read", (req: Request, res: Response) => console.log("TODO"))

notification.get("/list-unread", (req: Request, res: Response) => console.log("TODO"))

export default notification
