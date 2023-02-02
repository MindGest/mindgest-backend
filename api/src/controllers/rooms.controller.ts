import prisma from "../utils/prisma"
import { appointment } from "@prisma/client"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { verifyAccessToken, verifyToken } from "../services/auth.service"
import { QueryListRooms, RoomCreateBody, GetAvailableRoomsBody } from "../utils/types"
import logger from "../utils/logger"
import moment from "moment"

export async function listAppointmentRooms(
  req: Request<{}, {}, {}, QueryListRooms>,
  res: Response
) {
  try {
    var dateString = req.query.date

    var month = ""
    var day = ""
    var year = ""

    if (dateString != null) {
      var check = moment(req.query.date, "YYYY/MM/DD")
      month = check.format("M")
      day = check.format("D")
      year = check.format("YYYY")
    } else {
      var check = moment()
      month = check.format("M")
      day = check.format("D")
      year = check.format("YYYY")
    }

    var room = req.query.room

    var roomsAppointments = []

    console.log(req.query)

    if (room == null) {
      var rooms = await prisma.room.findMany()

      for (var roomId of rooms) {
        let appointments
        if (dateString != null) {
          appointments = await prisma.$queryRaw<
            appointment[]
          >`Select * from appointment where room_id= ${
            roomId.id
          } and extract(month from slot_start_date) = ${parseInt(
            month
          )} and extract(year from slot_start_date) = ${parseInt(
            year
          )} and extract(day from slot_start_date) = ${parseInt(day)}`
        } else {
          let today = new Date()
          appointments = await prisma.appointment.findMany({
            where: {
              slot_start_date: {
                gte: today,
              },
            },
            orderBy: {
              slot_start_date: "asc",
            },
          })
        }

        var roomAppointments = []

        let lastAppointmentHour = "00:00"
        let lastDay = ""
        let lastDate = ""

        for (var appointment of appointments) {
          var processId = await prisma.appointment_process.findFirst({
            where: {
              appointment_slot_id: appointment.slot_id,
            },
          })

          var therapists = await prisma.therapist_process.findMany({
            where: {
              process_id: processId?.process_id,
            },
          })

          var title = ""

          var therapistsInfo = []

          for (var therapist of therapists) {
            var therapistName = await prisma.person.findUnique({
              where: {
                id: therapist.therapist_person_id,
              },
            })

            therapistsInfo.push({ name: therapistName?.name, id: therapistName?.id })

            title += therapistName?.name + " e "
          }

          title = title.substring(0, title.length - 2)

          var process = await prisma.process.findUnique({
            where: {
              id: processId?.process_id,
            },
          })

          title += "Esp-" + process?.speciality_speciality

          var patientProcessId = await prisma.patient_process.findFirst({
            where: {
              process_id: process?.id,
            },
          })

          var patientInfo = await prisma.person.findUnique({
            where: {
              id: patientProcessId?.patient_person_id,
            },
          })

          let dateStart = appointment.slot_start_date
          const formattedDate1 = dateStart?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })

          let dateEnd = appointment.slot_end_date
          const formattedDate2 = dateEnd?.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })

          if (lastDay != formattedDate1.split("/")[0]) {
            if (lastAppointmentHour != "24:00" && lastDate != "") {
              let dateEndDay = lastDate.split(", ")[0] + ", " + "24:00"
              roomAppointments.push({
                title: "empty",
                speciality: "empty",
                id: "empty",
                startDate: lastDate,
                endDate: dateEndDay,
                therapists: [],
                userId: -1,
                userName: "empty",
              })
            }
            lastAppointmentHour = "00:00"
            lastDay = formattedDate1.split("/")[0]
          }

          lastDate = formattedDate2

          let startHour = formattedDate1.split(", ")[1]
          if (startHour != lastAppointmentHour) {
            let newDate = formattedDate1.split(", ")[0] + ", " + lastAppointmentHour

            roomAppointments.push({
              title: "empty",
              speciality: "empty",
              id: "empty",
              startDate: newDate,
              endDate: formattedDate1,
              therapists: [],
              userId: -1,
              userName: "empty",
            })

            lastAppointmentHour = formattedDate2.split(", ")[1]
          }

          roomAppointments.push({
            title: title,
            speciality: process?.speciality_speciality,
            id: appointment.slot_id,
            startDate: formattedDate1,
            endDate: formattedDate2,
            therapists: therapistsInfo,
            userId: patientInfo?.id,
            userName: patientInfo?.name,
          })
        }

        if (lastAppointmentHour != "24:00" && lastDate != "") {
          let dateEndDay = lastDate.split(", ")[0] + ", " + "24:00"
          roomAppointments.push({
            title: "empty",
            speciality: "empty",
            id: "empty",
            startDate: lastDate,
            endDate: dateEndDay,
            therapists: [],
            userId: -1,
            userName: "empty",
          })
        }

        roomsAppointments.push({
          room: roomId.name,
          roomId: roomId.id,
          appointmentsRoom: roomAppointments,
        })
      }
    } else {
      var appointments = await prisma.$queryRaw<
        appointment[]
      >`Select * from appointment where room_id= ${parseInt(
        room
      )} and extract(month from slot_start_date) = ${parseInt(
        month
      )} and extract(year from slot_start_date) = ${parseInt(
        year
      )} and extract(day from slot_start_date) = ${parseInt(day)}`

      var roomAppointments = []

      for (var appointment of appointments) {
        var processId = await prisma.appointment_process.findFirst({
          where: {
            appointment_slot_id: appointment.slot_id,
          },
        })

        var therapists = await prisma.therapist_process.findMany({
          where: {
            process_id: processId?.process_id,
          },
        })

        var title = ""

        for (var therapist of therapists) {
          var therapistName = await prisma.person.findUnique({
            where: {
              id: therapist.therapist_person_id,
            },
          })

          title += therapistName?.name + " e "
        }

        title = title.substring(0, title.length - 2)

        var process = await prisma.process.findUnique({
          where: {
            id: processId?.process_id,
          },
        })

        title += "Esp-" + process?.speciality_speciality

        roomAppointments.push({
          title: title,
          id: appointment.slot_id,
          startDate: appointment.slot_start_date,
          endDate: appointment.slot_end_date,
        })
      }

      var roomName = await prisma.room.findUnique({
        where: {
          id: parseInt(room),
        },
      })

      roomsAppointments.push({
        room: roomName,
        roomId: parseInt(room),
        appointmentsRoom: roomAppointments,
      })
    }

    res.status(StatusCodes.OK).json({
      message: roomsAppointments,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request<{}, {}, {}>, res: Response) {
  try {
    var rooms = await prisma.room.findMany()

    var roomsInfo = []

    for (var room of rooms) {
      roomsInfo.push({ name: room.name, id: room.id })
    }
    res.status(StatusCodes.OK).json({
      message: roomsInfo,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function create(req: Request<{}, {}, RoomCreateBody>, res: Response) {
  try {
    await prisma.room.create({
      data: {
        name: req.body.name,
      },
    })
    res.status(StatusCodes.OK).json({
      message: "Room Created",
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getAvailableRooms(
  req: Request<{}, {}, GetAvailableRoomsBody>,
  res: Response
) {
  /**
   * Returns the available rooms for the given time interval (from starting date to ending date).
   * Only available rooms for the full time interval.
   */

  // TODO: verificar permissões -> não me apetece, desculpem.

  // create the dates
  let startDate = new Date(req.body.startDate)
  let endDate = new Date(req.body.endDate)

  // obter os appointments que estão dentro (todo ou em parte) do intervalo.
  let appointments = await prisma.appointment.findMany()
  let roomIdsOfTheAppointmentsInTheTimeInterval = []
  for (let i = 0; i < appointments.length; i++) {
    let appointmentStartDate = new Date(appointments[i].slot_start_date)
    let appointmentEndDate = new Date(appointments[i].slot_end_date)
    // check if the appointment overlaps the specified time interval
    if (
      appointmentStartDate.getTime() < endDate.getTime() &&
      appointmentEndDate.getTime() > startDate.getTime()
    ) {
      roomIdsOfTheAppointmentsInTheTimeInterval.push(appointments[i].room_id)
    }
  }

  // get the ids of all the rooms
  let rooms = await prisma.room.findMany()

  // compute free rooms
  let freeRooms = []
  for (let i = 0; i < rooms.length; i++) {
    // if this room is not being used in the specified interval
    if (!roomIdsOfTheAppointmentsInTheTimeInterval.includes(rooms[i].id)) {
      freeRooms.push(rooms[i])
    }
  }

  // return freeRooms
  res.status(StatusCodes.OK).json({
    data: freeRooms,
  })
}

export default {
  listAppointmentRooms,
  list,
  create,
  getAvailableRooms,
}
