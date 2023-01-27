import prisma from "../utils/prisma"
import { Request, Response } from "express"

export async function create(req: Request, res: Response) {
  console.log("Coming Soon")
}
export async function list(req: Request, res: Response) {
  let decode = res.locals.token
  let id = decode.id

  let therapistProcesses = await prisma.therapist_process.findMany({
    where:{
      therapist_person_id:id
    }
  })

  let usersInfo = []
  for(let processInfo of therapistProcesses){
    let usersProcess = await prisma.patient_process.findMany({
      where:{
        process_id: processInfo.process_id
      }
    })

    for(let user of usersProcess){
      let userInfo = await prisma.person.findUnique({
        where:{
          id:user.patient_person_id
        }
      })

      let userMoreInfo = await prisma.patient.findUnique({
        where:{
          person_id: user.patient_person_id
        }
      })

      let responsable = await prisma.liable.findFirst({
        where:{
          
        }
      })
    }
  }

}

export default { create, list }
