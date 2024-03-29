import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { verifyAccessToken, verifyToken } from "../services/auth.service"
import { StatisticsBody } from "../utils/types"
import logger from "../utils/logger"

export async function statistics(req: Request<{}, {}, StatisticsBody>, res: Response) {
  var body = req.body

  let decode = res.locals.token
  let callerId = decode.id
  let callerRole = decode.role

  let parsedDateStart = new Date(body.startDate)
  let timestampStart = parsedDateStart.getTime()

  let parsedDateEnd = new Date(body.endDate)
  let timestampEnd = parsedDateEnd.getTime()

  let processes = []

  // obter os ids dos processos
  // criar um array de {process_id: <id>}
  // given the process, ignore other filters
  if (body.processId != null) {
    processes.push({ process_id: body.processId })
  }
  // given therapist and speciality
  else if (body.therapistId != null && body.speciality != null) {
    // all the therapists processess
    let therapist_process = await prisma.therapist_process.findMany({
      where: { therapist_person_id: body.therapistId },
    })
    // filter by speciality
    for (let i = 0; i < therapist_process.length; i++) {
      let process = await prisma.process.findFirst({
        where: { id: therapist_process[i].process_id, speciality_speciality: body.speciality },
      })
      if (process != null) {
        processes.push({ process_id: process.id })
      }
    }
  }
  // given only therapist
  else if (body.therapistId != null) {
    processes = await prisma.therapist_process.findMany({
      where: { therapist_person_id: body.therapistId },
    })
  }
  // given only speciality
  else if (body.speciality != null) {
    // used to get the id, so that a pre defined array can be assembled
    let processesInfo = await prisma.process.findMany({
      where: { speciality_speciality: body.speciality },
      select: { id: true },
    })
    for (let i = 0; i < processesInfo.length; i++) {
      processes.push({ process_id: processesInfo[i].id })
    }
  }
  // else, use all the processes
  else {
    let processesInfo = await prisma.process.findMany({ select: { id: true } })
    for (let i = 0; i < processesInfo.length; i++) {
      processes.push({ process_id: processesInfo[i].id })
    }
  }

  // if the caller is an intern, filter the processes by the ones that he has permissions to do the statistics
  if (callerRole == "intern") {
    let tempProcesses = processes
    processes = []
    for (let i = 0; i < tempProcesses.length; i++) {
      let permissionsIntern = await prisma.permissions.findFirst({
        where: { person_id: callerId, process_id: tempProcesses[i].process_id },
      })
      if (permissionsIntern != null && permissionsIntern.statitics) {
        processes.push(tempProcesses[i])
      }
    }
  }

  // calcular as cenas
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
      id: processInfo.process_id,
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
