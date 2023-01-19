import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import logger from "../utils/logger"
import { EditProfileBody, EditProfileParams } from "../utils/types"

//TODO: DOCUMENTAR
export async function listPatients(req: Request, res: Response){
    var decoded = res.locals.token
    var id = decoded.id

    if(decoded.role !== "therapist"){
        return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Wrong role of account",
          })
    }

    var processesTherapist = await prisma.therapist_process.findMany({
        where:{
            therapist_person_id:id
        }
    })

    let info = []

    for (let processId of processesTherapist) {
        let process = await prisma.process.findUnique({
            where:{
                id: processId.process_id
            }
        })

        let userId = await prisma.patient_process.findFirst({
            where:{
                process_id: processId.process_id
            }
        })   

        let userInfo = await prisma.person.findUnique({
            where:{
                id: userId?.patient_person_id
            }
        })

        let therapists = await prisma.therapist_process.findMany({
            where:{
                process_id:processId.process_id
            }
        })

        let therapistsName = []

        for (let therapistId of therapists) {
            let therapistInfo = await prisma.person.findUnique({
                where:{
                    id: therapistId.therapist_person_id
                }
            })

            therapistsName.push({"name": therapistInfo?.name})
        }

        info.push({"patientName":userInfo?.name, "speciality": process?.speciality_speciality, "ref": process?.ref, "therapists": therapistsName})
    }
    return res.status(StatusCodes.OK).json({
        message: info,
      })
}

export default {
    listPatients,
  }
  