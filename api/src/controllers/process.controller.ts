import prisma from '../utils/prisma'

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { verifyAccessToken, verifyToken } from '../services/auth.service'
import { ArchiveProcessBody, VerificationToken } from '../utils/types'
import logger from '../utils/logger'
import { AppointmentProcess, InternProcess, Therapist, TherapistProcess } from '@prisma/client'

export async function archive(req: Request<{}, {}, ArchiveProcessBody>, res: Response){
    try {
        // Fetch and decoded the verification token
        let decoded = verifyToken<VerificationToken>(req.body.token)
        
        if (!decoded) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Invalid Verification Token',
            })
        }
        var processId = req.body.processId
        await prisma.process.update({
            data:{active: false},
            where: {id: processId}
        })
        return res.status(StatusCodes.OK).json({
            message: 'Process Archived!',
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Ups... Something went wrong',
        })
    }
}

export async function info(req: Request<{}, {}, ArchiveProcessBody>, res: Response){
    try {
        // Fetch and decoded the verification token
        let decoded = verifyAccessToken<VerificationToken>(req.body.token)
        
        if (!decoded) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Invalid Verification Token',
            })
        }

        var processId = req.body.processId
        
        var therapists = await prisma.therapistProcess.findMany({
            where:{
                process_id: processId
            }
        })

        var responsibleTherapists: string[] = []

        therapists.forEach(async (therapist:TherapistProcess) => {
            var person = await prisma.person.findUnique({
                where:{
                    id: therapist.therapist_person_id
                }
            })
            responsibleTherapists.push(person!.name)
        })

        var process = await prisma.process.findUnique({
            where:{
                id:processId
            }
        })

        var processRef = process?.ref;

        var interns = await prisma.internProcess.findMany({
            where:{
                process_id: processId
            }
        })

        var colaborators: string[] = []

        interns.forEach(async (intern:InternProcess)=>{
            var internName = await prisma.person.findUnique({
                where:{
                    id:intern.intern_person_id
                }
            })
            colaborators.push(internName!.name)
        })

        var utent = await prisma.patientProcess.findFirst({
            where:{
                process_id:processId
            }
        })

        var utentName = await prisma.person.findFirst({
            where:{
                id: utent?.patient_person_id
            }
        })

        //Nao temos especialidade do processo

        var active = process?.active;

        var apointments = await prisma.appointmentProcess.findMany({
            where:{
                process_id:processId
            }
        })

        var isPayed = true

        apointments.forEach(async (apointment:AppointmentProcess)=>{
            var receipt = await prisma.receipt.findFirst({
                where:{
                    appointment_slot_id:apointment.appointment_slot_id
                }
            })

            //falta ver se esta pago ou n
        })

        return res.status(StatusCodes.OK).json({
            therapeuts: responsibleTherapists,
            ref: processRef,
            colaborators: colaborators,
            utent: utentName?.name,
            state: process?.active,
            financialSituation: isPayed,
            //especiality:,
            message: 'Process Archived!',
        })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Ups... Something went wrong',
        })
    }
}



export default { archive }