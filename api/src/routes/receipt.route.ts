import { Request, Response } from "express"
import { Router } from "express"

const receipt = Router()

receipt.get("/list", (req: Request, res: Response) => console.log("TODO"))

receipt.post("/create", (req: Request, res: Response) => console.log("TODO"))

receipt.put("/pay", (req: Request, res: Response) => console.log("TODO"))

export default receipt
