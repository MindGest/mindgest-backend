import prisma from "../utils/prisma"
import { appointment } from "@prisma/client"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { verifyAccessToken, verifyToken } from "../services/auth.service"
import { QueryStatistics } from "../utils/types"
import logger from "../utils/logger"
import moment from "moment"

export async function statistics(req: Request<{}, {}, {}, QueryStatistics>, res: Response) {
  var query = req.query

  let decode = res.locals.token
  let id = decode.id

  if (query.therapistId != null) {
    id = query.therapistId
  }

  let parsedDateStart = new Date(query.startDate)
  let timestampStart = parsedDateStart.getTime()

  let parsedDateEnd = new Date(query.endDate)
  let timestampEnd = parsedDateEnd.getTime()

  let processes

  if (query.processId != null) {
    processes = await prisma.therapist_process.findMany({
      where: {
        therapist_person_id: id,
        process_id: parseInt(query.processId),
      },
    })
  } else {
    processes = await prisma.therapist_process.findMany({
      where: {
        therapist_person_id: id,
      },
    })
  }

  let data = []

  for (let processInfo of processes) {
    let info = await prisma.process.findUnique({
      where: {
        id: processInfo.process_id,
      },
    })

    let appointments = await prisma.appointment_process.findMany({
      where: {
        process_id: processInfo.process_id,
      },
    })

    let total = 0
    let appointmentInfos = []
    let n = 1
    for (let appointmentInfo of appointments) {
      let appointment = await prisma.appointment.findUnique({
        where: {
          slot_id: appointmentInfo.appointment_slot_id,
        },
      })

      let timestampEndAppointment = appointment!.slot_end_date.getTime()
      let timestampStartAppointment = appointment!.slot_start_date.getTime()

      console.log(timestampStart)
      console.log(timestampStartAppointment)

      if (timestampStartAppointment >= timestampStart && timestampEndAppointment <= timestampEnd) {
        let pricetable = await prisma.pricetable.findUnique({
          where: {
            id: appointment?.pricetable_id,
          },
        })

        total += pricetable!.price

        let date = appointment?.slot_start_date
        const formattedDate = date?.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })

        appointmentInfos.push({ n: n, date: formattedDate, cost: pricetable!.price })
        n += 1
      }
    }

    let mainTherapistInfo = await prisma.therapist_process.findMany({
      where: {
        process_id: processInfo.process_id,
      },
    })

    let mainTherapist = ""

    for (let therapist of mainTherapistInfo) {
      let isMain = await prisma.permissions.findFirst({
        where: {
          person_id: therapist.therapist_person_id,
          process_id: therapist.process_id,
        },
      })

      if (isMain?.isMain) {
        let therapistName = await prisma.person.findUnique({
          where: {
            id: isMain.person_id,
          },
        })

        mainTherapist = therapistName!.name
      }
    }

    let patientId = await prisma.patient_process.findFirst({
      where: {
        process_id: processInfo.process_id,
      },
    })

    let patientName = await prisma.person.findUnique({
      where: {
        id: patientId!.patient_person_id,
      },
    })

    data.push({
      speciality: info?.speciality_speciality,
      name: mainTherapist,
      patientName: patientName?.name,
      total: total,
      nAppointments: n - 1,
      appointments: appointmentInfos,
    })
  }

  res.status(StatusCodes.OK).json({
    message: data,
  })
}

export default {
  statistics,
}
