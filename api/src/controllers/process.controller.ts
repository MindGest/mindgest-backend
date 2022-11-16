import prisma from '../utils/prisma'

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { verifyAccessToken, verifyToken } from '../services/auth.service'
import { ArchiveProcessBody, VerificationToken, ProcessListBody } from '../utils/types'
import logger from '../utils/logger'
import { appointment_process, intern_process, therapist, therapist_process } from '@prisma/client'

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
        
        var therapists = await prisma.therapist_process.findMany({
            where:{
                process_id: processId
            }
        })

        var responsibleTherapists: string[] = []

        therapists.forEach(async (therapist:therapist_process) => {
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

        var interns = await prisma.intern_process.findMany({
            where:{
                process_id: processId
            }
        })

        var colaborators: string[] = []

        interns.forEach(async (intern:intern_process)=>{
            var internName = await prisma.person.findUnique({
                where:{
                    id:intern.intern_person_id
                }
            })
            colaborators.push(internName!.name)
        })

        var utent = await prisma.patient_process.findFirst({
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

        var apointments = await prisma.appointment_process.findMany({
            where:{
                process_id:processId
            }
        })

        var isPayed = true

        apointments.forEach(async (apointment:appointment_process)=>{
            var receipt = await prisma.receipt.findFirst({
                where:{
                    appointment_slot_id:apointment.appointment_slot_id
                }
            })
            if(receipt!.payed==false){
                isPayed = false;
            }
        
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

export async function list(req: Request<{}, {}, ProcessListBody>, res: Response){
    try {
        // Fetch and decoded the verification token
        let decoded = verifyToken<VerificationToken>(req.body.token)
        
        if (!decoded) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: 'Invalid Verification Token',
            })
        }

        var processes = await prisma.process.findMany() //so ativos ou n?


        

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Ups... Something went wrong',
        })
    }
}



export default { archive }