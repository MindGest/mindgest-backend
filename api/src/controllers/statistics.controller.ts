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
  var appointments

  let decode = res.locals.token
  let id = decode.id

  if(query.therapistId != null){
    id = query.therapistId
  }


  if (query.startDate == null || query.endDate == null) {
    appointments = await prisma.appointment.findMany()
  } else {
    var check1 = moment(req.query.startDate, "YYYY/MM/DD")
    var monthStart = check1.format("M")
    var dayStart = check1.format("D")
    var yearStart = check1.format("YYYY")

    var check2 = moment(req.query.endDate, "YYYY/MM/DD")
    var monthEnd = check2.format("M")
    var dayEnd = check2.format("D")
    var yearEnd = check2.format("YYYY")

    appointments = await prisma.$queryRaw<
      appointment[]
    >`Select * from appointment where extract(month from slot_start_date) >= ${parseInt(
      monthStart
    )} and extract(year from slot_start_date) >= ${parseInt(
      yearStart
    )} and extract(day from slot_start_date) >= ${parseInt(dayStart)}
        INTERSECT
        Select * from appointment where extract(month from slot_end_date) <= ${parseInt(
          monthEnd
        )} and extract(year from slot_end_date) <= ${parseInt(
      yearEnd
    )} and extract(day from slot_end_date) <= ${parseInt(dayEnd)}`
  }

  var specialitiesAppointments = new Map<string, number>()
  var processAppointments = new Map<string, number>()
  var therapistsApointments = new Map<string, number>()

  var total = 0

  for (let appointment of appointments) {
    var processAppointment = await prisma.appointment_process.findFirst({
      where: {
        appointment_slot_id: appointment.slot_id,
      },
    })

    if (
      query.processId == null ||
      (query.processId != null && processAppointment?.process_id!.toString() == query.processId!)
    ) {
      var process = await prisma.process.findUnique({
        where: {
          id: processAppointment?.process_id,
        },
      })

      var speciality = process!.speciality_speciality

      if (
        query.specialityId == null ||
        (query.specialityId != null && speciality == query.specialityId)
      ) {
        var therapistsProcess = await prisma.therapist_process.findMany({
          where: {
            process_id: processAppointment?.process_id,
          },
        })

        if (id != null) {
          var flag = false

          for (let therapist of therapistsProcess) {
            var therapistInfo = await prisma.person.findUnique({
              where: {
                id: therapist.therapist_person_id,
              },
            })

            if (id! == therapistInfo?.id.toString()) {
              flag = true
              if (therapistsApointments.has(therapistInfo!.name)) {
                therapistsApointments.set(
                  therapistInfo!.name,
                  therapistsApointments.get(therapistInfo!.name)! + 1
                )
              } else {
                therapistsApointments.set(therapistInfo!.name, 1)
              }
            }

            if (flag) {
              total += 1
              if (specialitiesAppointments.has(speciality)) {
                specialitiesAppointments.set(
                  speciality,
                  specialitiesAppointments.get(speciality)! + 1
                )
              } else {
                specialitiesAppointments.set(speciality, 1)
              }

              if (processAppointments.has(`${process!.id}`)) {
                processAppointments.set(
                  `${process!.id}`,
                  processAppointments.get(`${process!.id}`)! + 1
                )
              } else {
                processAppointments.set(`${process!.id}`, 1)
              }
            }
          }
        } else {
          total += 1
          if (specialitiesAppointments.has(speciality)) {
            specialitiesAppointments.set(speciality, specialitiesAppointments.get(speciality)! + 1)
          } else {
            specialitiesAppointments.set(speciality, 1)
          }

          if (processAppointments.has(`${process!.id}`)) {
            processAppointments.set(
              `${process!.id}`,
              processAppointments.get(`${process!.id}`)! + 1
            )
          } else {
            processAppointments.set(`${process!.id}`, 1)
          }
        }
      }
    }
  }

  var restOfTherapists = await prisma.therapist.findMany()

  for (let therapist of restOfTherapists) {
    var therapistInfo = await prisma.person.findUnique({
      where: {
        id: therapist.person_id,
      },
    })

    if (!therapistsApointments.has(therapistInfo!.name)) {
      therapistsApointments.set(therapistInfo!.name, 0)
    }
  }

  if (query.processId == null) {
    var restOfProcess = await prisma.process.findMany()

    for (let process of restOfProcess) {
      if (!processAppointments.has(`${process!.id}`)) {
        processAppointments.set(`${process!.id}`, 0)
      }
    }
  } else {
    if (!processAppointments.has(query.processId)) {
      processAppointments.set(query.processId, 0)
    }
  }

  if (query.specialityId == null) {
    var restOfSpecialities = await prisma.speciality.findMany()

    for (let speciality of restOfSpecialities) {
      if (!specialitiesAppointments.has(speciality.speciality)) {
        specialitiesAppointments.set(speciality.speciality, 0)
      }
    }
  } else {
    if (!specialitiesAppointments.has(query.specialityId)) {
      specialitiesAppointments.set(query.specialityId, 0)
    }
  }

  var specialityFormated: { speciality: string; total: number }[] = []

  specialitiesAppointments.forEach((value, key) => {
    specialityFormated.push({ speciality: key, total: value })
  })

  var therapistFormated: { therapist: string; total: number }[] = []

  therapistsApointments.forEach((value, key) => {
    therapistFormated.push({ therapist: key, total: value })
  })

  var processFormated: { processId: string; total: number }[] = []

  processAppointments.forEach((value, key) => {
    processFormated.push({ processId: key, total: value })
  })

  //TODO: SEND EMAIL TO USER/ADMIN
  res.status(StatusCodes.OK).json({
    totalAppointments: total,
    specialitiesAppointments: specialityFormated,
    processAppointments: processFormated,
    therapistsApointments: therapistFormated,
  })
}

export default {
  statistics,
}
