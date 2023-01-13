import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { verifyAccessToken, verifyToken } from "../services/auth.service"
import { QueryListReceipt } from "../utils/types"
import logger from "../utils/logger"
import appointment from "../routes/appointment.route"
import { receipt } from "@prisma/client"

export async function list(req: Request<{}, {}, {}, QueryListReceipt>, res: Response) {
  try {
    var queryParams = req.query

    var payed = true
    var notPayed = true
    if (queryParams.payed != null) {
      payed = queryParams.payed === "true"
    }
    if (queryParams.notPayed != null) {
      notPayed = queryParams.notPayed === "true"
    }

    if ((payed == notPayed) == false) {
      return res.status(StatusCodes.OK).json({
        message: [],
      })
    }

    var listOfReceipts = []

    if (queryParams.userId == null) {
      var listReceipts: receipt[] = []

      if ((payed == notPayed) == true) {
        listReceipts = await prisma.receipt.findMany()
      } else if (payed == true) {
        listReceipts = await prisma.receipt.findMany({
          where: {
            payed: true,
          },
        })
      } else if (notPayed == true) {
        listReceipts = await prisma.receipt.findMany({
          where: {
            payed: false,
          },
        })
      }

      for (let receipt of listReceipts) {
        var appointment = await prisma.appointment.findUnique({
          where: {
            slot_id: receipt.appointment_slot_id,
          },
        })

        var appointment_process = await prisma.appointment_process.findFirst({
          where: {
            appointment_slot_id: appointment?.slot_id,
          },
        })

        var process = await prisma.process.findUnique({
          where: {
            id: appointment_process?.process_id,
          },
        })

        var patientProcess = await prisma.patient_process.findFirst({
          where: {
            process_id: process?.id,
          },
        })

        var patient = await prisma.person.findUnique({
          where: {
            id: patientProcess?.patient_person_id,
          },
        })

        var therapists = await prisma.therapist_process.findMany({
          where: {
            process_id: process?.id,
          },
        })

        var flag = false
        var mainTherapist
        for (let therapist of therapists) {
          if (flag == false) {
            var permissions = await prisma.permissions.findFirst({
              where: {
                person_id: therapist.therapist_person_id,
                process_id: process?.id,
              },
            })

            if (permissions?.isMain) {
              mainTherapist = therapist.therapist_person_id
            }
          }
        }

        var mainTherapistObject = await prisma.person.findUnique({
          where: {
            id: mainTherapist,
          },
        })

        var moreInfoPatient = await prisma.patient.findFirst({
          where:{
            person_id: patient?.id
          }
        })

        console.log(appointment)
        let dateParsed = new Date(appointment!.slot_end_date)
        const currentTime = new Date();

        let isDone = ''

        
        if (currentTime.getTime() > dateParsed.getTime()) {
          isDone="Concluída"
        } else {
          isDone="Não Concluída"
        }

        let price = await prisma.pricetable.findFirst({
          where:{
            id: appointment?.pricetable_id
          }
        })

        listOfReceipts.push({
          patientName: patient?.name,
          mainTherapist: mainTherapistObject?.name,
          ref: receipt?.ref,
          date: receipt?.datetime,
          nif: patient?.tax_number, 
          sns:moreInfoPatient?.health_number,
          morada:patient?.address, 
          email: patient?.email, 
          estado: isDone,
          custo: price?.price,
          pago: receipt.payed
        })
      }
    } else {
      var userId = parseInt(queryParams.userId)
      var processId = await prisma.patient_process.findFirst({
        where: {
          patient_person_id: userId,
        },
      })

      var appointments = await prisma.appointment_process.findMany({
        where: {
          process_id: processId?.process_id,
        },
      })

      for (let appointment of appointments) {
        var appointmentInfo = await prisma.appointment.findUnique({
          where: {
            slot_id: appointment.appointment_slot_id,
          },
        })

        var receipt = await prisma.receipt.findFirst({
          where: {
            appointment_slot_id: appointmentInfo?.slot_id,
          },
        })

        var process = await prisma.process.findUnique({
          where: {
            id: appointment?.process_id,
          },
        })

        var patientProcess = await prisma.patient_process.findFirst({
          where: {
            process_id: process?.id,
          },
        })

        var patient = await prisma.person.findUnique({
          where: {
            id: patientProcess?.patient_person_id,
          },
        })

        var therapists = await prisma.therapist_process.findMany({
          where: {
            process_id: process?.id,
          },
        })

        var flag = false
        var mainTherapist
        for (let therapist of therapists) {
          var person = await prisma.person.findUnique({
            where: {
              id: therapist.therapist_person_id,
            },
          })
          if (flag == false) {
            var permissions = await prisma.permissions.findFirst({
              where: {
                person_id: therapist.therapist_person_id,
                process_id: process?.id,
              },
            })

            if (permissions?.isMain) {
              mainTherapist = therapist.therapist_person_id
            }
          }
        }

        var mainTherapistObject = await prisma.person.findUnique({
          where: {
            id: mainTherapist,
          },
        })

        var moreInfoPatient = await prisma.patient.findFirst({
          where:{
            person_id: patient?.id
          }
        })

        let dateParsed = new Date(appointmentInfo!.slot_end_date)
        const currentTime = new Date();

        let isDone = ''
        if (currentTime.getTime() > dateParsed.getTime()) {
          isDone="Concluída"
        } else {
          isDone="Não Concluída"
        }
        let price = await prisma.pricetable.findFirst({
          where:{
            id: appointmentInfo?.pricetable_id
          }
        })

        if (
          (payed == notPayed) == true ||
          (payed == true && receipt?.payed) ||
          (notPayed == true && !receipt?.payed)
        ) {
          listOfReceipts.push({
            patientName: patient?.name,
            mainTherapist: mainTherapistObject?.name,
            ref: receipt?.ref,
            date: receipt?.datetime,
            nif: patient?.tax_number, 
            sns:moreInfoPatient?.health_number,
            morada:patient?.address, 
            email: patient?.email, 
            estado: isDone,
            custo: price?.price,
            pago: receipt?.payed
          })
        }
      }
    }
    return res.status(StatusCodes.OK).json({
      message: listOfReceipts,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function create(req: Request, res: Response) {
  try {
    var appointmentId = parseInt(req.params.appointmentId)
    var ref = (Math.random() + 1).toString(36).substring(7) //isto ta a fazer random, depois mudar i guess
    var datetime = new Date()

    await prisma.receipt.create({
      data: {
        ref: ref,
        appointment_slot_id: appointmentId,
        datetime: datetime,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "Receipt Created",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function pay(req: Request, res: Response) {
  try {
    var receiptId = parseInt(req.params.receiptId)

    await prisma.receipt.update({
      data: { payed: true },
      where: { id: receiptId },
    })
    return res.status(StatusCodes.OK).json({
      message: "Receipt Payed!",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  list,
  create,
  pay,
}
