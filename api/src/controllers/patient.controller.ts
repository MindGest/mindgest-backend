import { Request, Response } from "express"

export async function create(req: Request, res: Response) {
  console.log("Coming Soon")
}
export async function list(req: Request, res: Response) {
  console.log("Coming Soon")
}

export default { create, list }
