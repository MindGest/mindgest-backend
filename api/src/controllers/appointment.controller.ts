import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import assert from "assert"

import prisma from "../utils/prisma"
import logger from "../utils/logger"

import {
  AppointmentArchive,
  AppointmentCreate,
  AppointmentsList,
  AppointmentInfo,
  AppointmentEdit,
} from "../utils/types"

import { User } from "../utils/schemas"
import { buildReceipt } from "../services/receipt.service"

export async function getAllAppointments(req: Request<{}, {}, AppointmentsList>, res: Response) {
  /**
   * Returns all the appointments of a therapist if a valid id is given, or all if the id value is "-1"
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // prepare vars
    var isTherapist = false
    var isIntern = false
    var therapistId = -1
    var internId = -1

    console.log(req.body.filterId)

    if (callerRole == "accountant") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to see this content.",
      })
    }

    if ((callerRole == "admin" || callerRole == "guard") && req.body.filterId != -1) {
      // the processes of the specified filterId
      // find out if the given id is from a therapist or an intern
      var userType = await getUserType(req.body.filterId)
      console.log(userType)
      switch (userType) {
        case "therapist":
          isTherapist = true
          therapistId = req.body.filterId
          break
        case "intern":
          isIntern = true
          internId = req.body.filterId
          break
        case "error":
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "The given id does not belong to a therapist nor an intern.",
          })
      }
    } else if (callerRole == "therapist") {
      isTherapist = true
      therapistId = callerId
    } else if (callerRole == "intern") {
      isIntern = true
      internId = callerId
    }

    // all appointments
    var processIds: Array<number> = []
    // get the ids of the processes of the specified user
    if (isTherapist) {
      var therapists_process = await prisma.therapist_process.findMany({
        where: { therapist_person_id: therapistId },
      })
      for (let i = 0; i < therapists_process.length; i++) {
        processIds.push(Number(therapists_process[i].process_id))
      }
    } else if (isIntern) {
      var interns_process = await prisma.intern_process.findMany({
        where: { intern_person_id: internId },
      })
      for (let i = 0; i < interns_process.length; i++) {
        // add a check to see if the intern has permissions
        var permissions = await retrieveInternPermissions(
          internId,
          Number(interns_process[i].process_id)
        )
        if (permissions != null && permissions.see == true) {
          // if null it is not shown either
          processIds.push(Number(interns_process[i].process_id))
        }
      }
    }

    // get the processes
    var processes: any = []
    if ((callerRole == "admin" || callerRole == "guard") && req.body.filterId == -1) {
      // all processes
      processes = await prisma.process.findMany()
    } else {
      // either intern or therapist
      for (let i = 0; i < processIds.length; i++) {
        processes.push(
          await prisma.process.findFirst({
            where: { id: processIds[i] },
          })
        )
      }
    }

    var allAppointmentsInfo: any = []
    for (let i = 0; i < processes.length; i++) {
      // get the appointments of the processes[i]
      var appointment_process = await prisma.appointment_process.findMany({
        where: { process_id: processes[i].id },
      })
      // get the interns of the processes[i]
      var intern_process = await prisma.intern_process.findMany({
        where: { process_id: processes[i].id },
      })
      var interns: any = []
      var intern
      for (let e = 0; e < intern_process.length; e++) {
        intern = await prisma.intern.findFirst({
          where: { person_id: intern_process[e].intern_person_id },
          include: {
            person: {
              select: {
                name: true,
                // email: true,
                // address: true,
                // birth_date: true,
                // phone_number: true
              },
            },
          },
        })
        interns.push(intern?.person.name)
      }

      // get the therapists of the processes[i]
      var therapist_process = await prisma.therapist_process.findMany({
        where: { process_id: processes[i].id },
      })
      var therapists: any = []
      var therapist
      for (let e = 0; e < therapist_process.length; e++) {
        therapist = await prisma.therapist.findFirst({
          where: { person_id: therapist_process[e].therapist_person_id },
          select: {
            //extern: true,
            //cedula: true,
            //healthsystem: true,
            person: {
              select: {
                name: true,
                //email: true,
                //address: true,
                //birth_date: true,
                //phone_number: true
              },
            },
          },
        })
        therapists.push(therapist?.person.name)
      }

      // get the patients of the processes[i]
      var patient_process = await prisma.patient_process.findMany({
        where: { process_id: processes[i].id },
      })
      var patients: any = []
      for (let e = 0; e < patient_process.length; e++) {
        let patient = await prisma.person.findFirst({
          where: { id: patient_process[e].patient_person_id },
        })
        patients.push(patient?.name)
      }

      for (let e = 0; e < appointment_process.length; e++) {
        // obtain the appointment info
        var appointmentInfo = await prisma.appointment.findFirst({
          where: { slot_id: appointment_process[e].appointment_slot_id },
          select: {
            slot_id: true,
            online: true,
            slot_start_date: true,
            slot_end_date: true,
            room: {
              select: { name: true },
            },
            pricetable: {
              select: {
                type: true,
                price: true,
              },
            },
          },
        })

        // get care takers
        let process_liable = await prisma.process_liable.findMany({
          where: { process_id: processes[i].id },
        })
        let careTakers = []
        for (let i = 0; i < process_liable.length; i++) {
          let careTaker = await prisma.liable.findFirst({
            where: { id: process_liable[i].liable_id },
          })
          careTakers.push(careTaker?.name)
        }

        // if it is paid
        // get the receipt (if null or not paid, it is not paid )
        let receipt = await prisma.receipt.findFirst({
          where: { appointment_slot_id: appointment_process[e].appointment_slot_id },
        })
        let paid = false
        if (receipt != null && receipt.payed) {
          paid = true
        }

        if (!appointmentInfo) {
          continue
        }

        if (callerRole == "guard") {
          allAppointmentsInfo.push({
            appointmentId: appointmentInfo.slot_id,
            appointmentStartTime: appointmentInfo.slot_start_date,
            appointmentEndTime: appointmentInfo.slot_end_date,
            appointmentRoom: appointmentInfo.room.name,
            //appointment: appointmentInfo,
            therapists: therapists,
            //interns: interns,
            //patients: patients,
            processId: processes[i].id,
          })
        } else {
          // build data for the current appointment
          allAppointmentsInfo.push({
            appointmentId: appointmentInfo.slot_id,
            appointmentStartTime: appointmentInfo.slot_start_date,
            appointmentEndTime: appointmentInfo.slot_end_date,
            appointmentRoom: appointmentInfo.room.name,
            //appointment: appointmentInfo,
            therapists: therapists,
            //interns: interns,
            patients: patients,
            careTakers: careTakers,
            paid: paid,
            processId: processes[i].id,
            speciality: processes[i].speciality_speciality,
          })
        }
      }
    }

    res.status(StatusCodes.OK).json({
      message: "It is working.",
      data: allAppointmentsInfo,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function listAppointmentsOfTheDay(req: Request, res: Response) {
  /**
   * Returns all the appointments of the current day for the calling therapist, intern or guard
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerRole = decodedToken.role
    var callerId = decodedToken.id

    if (callerRole == "acountant") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have access to this information.",
      })
    }

    var appointmentsOfToday = []
    var today = new Date()
    today.setHours(0, 0, 0, 0)
    var process_user = null

    if (callerRole == "guard" || callerRole == "admin") {
      // return all the appointments of the day
      var appointments = await prisma.appointment.findMany({
        select: {
          slot_start_date: true,
          slot_end_date: true,
          slot_id: true,
          room: { select: { name: true } },
        },
      })

      // filter the appointments of the current day
      for (let i = 0; i < appointments.length; i++) {
        var tempDate = new Date(appointments[i].slot_start_date)
        tempDate.setHours(0, 0, 0, 0)
        if (tempDate.getTime() == today.getTime()) {
          appointmentsOfToday.push(await getAppointmentInformation(appointments[i], false))
        }
      }
    } else {
      if (callerRole == "therapist") {
        // get the processes of the asking therapist (caller)
        process_user = await prisma.therapist_process.findMany({
          where: { therapist_person_id: callerId },
        })
      } else if (callerRole == "intern") {
        // get the processes of the asking intern (caller)
        process_user = await prisma.intern_process.findMany({
          where: { intern_person_id: callerId },
        })
      }
      if (process_user != null) {
        for (let i = 0; i < process_user.length; i++) {
          var appointment_process = await prisma.appointment_process.findMany({
            where: { process_id: process_user[i].process_id },
          })
          for (let e = 0; e < appointment_process.length; e++) {
            // get the appointment
            var appointment = await prisma.appointment.findFirst({
              where: { slot_id: appointment_process[e].appointment_slot_id },
              select: {
                slot_start_date: true,
                slot_end_date: true,
                slot_id: true,
                room: { select: { name: true } },
              },
            })

            if (appointment == null) {
              continue
            }
            var tempDate = new Date(appointment.slot_start_date)
            // filter by the current day
            tempDate.setHours(0, 0, 0, 0)
            if (tempDate.getTime() == today.getTime()) {
              appointmentsOfToday.push(await getAppointmentInformation(appointment, true))
            }
          }
        }
      }
    }

    // return info
    res.status(StatusCodes.OK).json({
      message: "It is working.",
      data: appointmentsOfToday,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function createAppointment(req: Request<{}, {}, AppointmentCreate>, res: Response) {
  /**
   * Creates an appointment
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // verify it the process exists
    var process = await prisma.process.findFirst({
      where: { id: req.body.processId },
    })
    if (!process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given process does not exist.",
      })
    }

    // verify if the caller can create an appointment
    if (callerRole == "therapist") {
      // check if the callerId is a therapist associated to the process
      var therapist_process = await prisma.therapist_process.findFirst({
        where: { process_id: process.id, therapist_person_id: callerId },
      })
      if (!therapist_process) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "It appears that you do not have permission to create an appointment, due to the fact that you are not associated with the its process.",
        })
      }
    } else if (callerRole == "intern") {
      // check if the callerId is an intern associated to the process
      var intern_process = await prisma.intern_process.findFirst({
        where: { process_id: process.id, intern_person_id: callerId },
      })
      if (!intern_process) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "It appears that you do not have permission to create an appointment, due to the fact that you are not associated with the its process.",
        })
      } else {
        // check if the intern has permissions to create an appointment for this process
        var permissions = await retrieveInternPermissions(callerId, Number(process.id))
        if (permissions == null || permissions.appoint == false) {
          // intern does not have permission to create an appointment
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              "It appears that you do not have permission to create an appointment, talk with one of the therapists in the process for more information.",
          })
        }
      }
    } else if (!(callerRole == "admin")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "It seems that you do not have permission to create an appointment.",
      })
    }

    // create the appointment
    console.log("here")
    console.log(req.body)
    var appointment = await prisma.appointment.create({
      data: {
        online: req.body.online,
        slot_start_date: req.body.startDate,
        slot_end_date: req.body.endDate,
        active: true,
        pricetable: {
          connect: { id: req.body.priceTableId },
        },
        room: {
          connect: { id: req.body.roomId },
        },
      },
    })
    console.log("here")
    // create the link between the process and the appointment
    await prisma.appointment_process.create({
      data: {
        appointment_slot_id: appointment.slot_id,
        process_id: req.body.processId,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "The appointment has been created.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function infoAppointment(req: Request<{}, {}, AppointmentInfo>, res: Response) {
  /**
   * returns the info of an appointment
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // prepare vars
    var isProcessTherapist: boolean = false // if the caller is a therapist in the process of the specified appointment
    var isProcessIntern: boolean = false // ...
    let canSee = false

    // get the appointment info
    var appointment = await prisma.appointment.findFirst({
      where: { slot_id: req.body.appointmentId },
      select: {
        slot_start_date: true,
        slot_end_date: true,
        slot_id: true,
        room: { select: { name: true } },
      },
    })
    if (!appointment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given appointment id does not exist.",
      })
    }
    // get the process info
    var appointment_process = await prisma.appointment_process.findFirst({
      where: { appointment_slot_id: req.body.appointmentId },
    })
    var process = await prisma.process.findFirst({
      where: { id: appointment_process?.process_id },
    })
    if (!process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Somehow, this appointment's process does not exist.",
      })
    }

    // get the name of the mainTherapist
    let mainTherapistPermissions = await prisma.permissions.findFirst({
      where: { process_id: process.id },
    })
    let mainTherapist = await prisma.person.findFirst({
      where: { id: mainTherapistPermissions?.person_id },
    })
    if (callerId == mainTherapist?.id) {
      // if the caller is the main therapist, he can see this info.
      canSee = true
    }

    // get the names of the collaborators
    let collaboratorsPermissions = await prisma.permissions.findMany({
      where: { process_id: process.id, isMain: false },
    })
    // build the names and see if the caller has permissions to see the info
    let collaborators = []
    for (let collaboratorPermissions of collaboratorsPermissions) {
      let person = await prisma.person.findFirst({
        where: { id: collaboratorPermissions.person_id },
      })
      collaborators.push(person?.name)
      // verify if the caller (if therapist or intern) can access this information
      if (callerId == collaboratorPermissions.person_id && collaboratorPermissions.see == true) {
        canSee = true
      }
    }

    // verify if the caller has the right permissions
    if (!(callerIsAdmin || canSee)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "It seems that you do not have permission access this information.",
      })
    }

    // get the patients
    var patients: any = []
    var patient
    var patient_process = await prisma.patient_process.findMany({
      where: { process_id: process.id },
    })
    if (patient_process.length == 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "It appears that there are no patients assigned to this process.",
      })
    }
    for (let i = 0; i < patient_process.length; i++) {
      patient = await prisma.patient.findFirst({
        where: { person_id: patient_process[i].patient_person_id },
        select: { person: { select: { name: true } } },
      })
      patients.push(patient?.person.name)
    }

    // get care takers
    let process_liable = await prisma.process_liable.findMany({
      where: { process_id: process.id },
    })
    let careTakers = []
    for (let i = 0; i < process_liable.length; i++) {
      let careTaker = await prisma.liable.findFirst({ where: { id: process_liable[i].liable_id } })
      careTakers.push(careTaker?.name)
    }

    // if it is paid
    // get the receipt (if null or not paid, it is not paid )
    let receipt = await prisma.receipt.findFirst({
      where: { appointment_slot_id: appointment.slot_id },
    })
    let paid = false
    if (receipt != null && receipt.payed) {
      paid = true
    }

    res.status(StatusCodes.OK).json({
      data: {
        appointmentStartTime: appointment.slot_start_date,
        appointmentEndTime: appointment.slot_end_date,
        appointmentRoom: appointment.room.name,
        appointmentId: appointment.slot_id,
        //appointment: appointmentInfo,
        mainTherapist: mainTherapist?.name,
        collaborators: collaborators,
        patients: patients,
        careTakers: careTakers,
        paid: paid,
        //process: processes[i]
        speciality: process.speciality_speciality,
        processRef: process.ref,
        processId: process.id,
      },
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function editAppointment(req: Request<{}, {}, AppointmentEdit>, res: Response) {
  /**
   * edits the properties of an appointment
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // obter o processo do appointment em questão
    var appointment_process = await prisma.appointment_process.findFirst({
      where: { appointment_slot_id: req.body.appointmentId },
    })
    if (!appointment_process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given appointment id does not exist.",
      })
    }
    var process = await prisma.process.findFirst({
      where: { id: appointment_process.process_id },
    })
    if (!process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message:
          "An critical error has occured. It seems that the process of this appointment does not exist.",
      })
    }
    // verificar se o caller pode fazer alterações
    if (callerRole == "therapist") {
      // check if the callerId is a therapist associated to the process
      var therapist_process = await prisma.therapist_process.findFirst({
        where: { process_id: process.id, therapist_person_id: callerId },
      })
      if (!therapist_process) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "It appears that you do not have permission to edit this appointment, due to the fact that you are not associated with the its process.",
        })
      }
    } else if (callerRole == "intern") {
      // check if the callerId is an intern associated to the process
      var intern_process = await prisma.intern_process.findFirst({
        where: { process_id: process.id, intern_person_id: callerId },
      })
      if (!intern_process) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "It appears that you do not have permission to edit this appointment, due to the fact that you are not associated with the its process.",
        })
      } else {
        // is an intern of the process, but needs to have the appoint permission
        var permissions = await retrieveInternPermissions(callerId, Number(process.id))
        if (permissions == null || permissions.appoint == false) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              "It appears that you do not have permission to edit an appointment, talk with one of the therapists in the process for more information.",
          })
        }
      }
    } else if (!(callerRole == "admin")) {
      // you shouldn't be here!!!
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to edit this appointment.",
      })
    }

    // efetuar as alterações
    await prisma.appointment.update({
      where: { slot_id: req.body.appointmentId },
      data: {
        slot_start_date: req.body.appointmentStart,
        slot_end_date: req.body.appointmentEnd,
        room: { connect: { id: req.body.appointmentRoomId } },
      },
    })

    res.status(StatusCodes.OK).json({
      message: "The appointment was successfully updated.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function archiveAppointment(req: Request<{}, {}, AppointmentArchive>, res: Response) {
  /**
   * archives an appointment
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // get the appointment
    var appointment_process = await prisma.appointment_process.findFirst({
      where: { appointment_slot_id: req.body.appointmentId },
    })
    if (!appointment_process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given appointment id does not exist.",
      })
    }
    // get the process
    var process = await prisma.process.findFirst({
      where: { id: appointment_process.process_id },
    })
    if (!process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message:
          "An critical error has occured. It seems that the process of this appointment does not exist.",
      })
    }

    if (callerRole == "therapist") {
      // check if the callerId is a therapist associated to the process
      var therapist_process = await prisma.therapist_process.findFirst({
        where: { process_id: process.id, therapist_person_id: callerId },
      })
      if (!therapist_process) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "It appears that you do not have permission to edit this appointment, due to the fact that you are not associated with the its process.",
        })
      }
    } else if (callerRole == "intern") {
      // check if the callerId is an intern associated to the process
      var intern_process = await prisma.intern_process.findFirst({
        where: { process_id: process.id, intern_person_id: callerId },
      })
      if (!intern_process) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "It appears that you do not have permission to edit this appointment, due to the fact that you are not associated with the its process.",
        })
      } else {
        // is an intern of the process, but needs to have the archive permission
        var permissions = await retrieveInternPermissions(callerId, Number(process.id))
        if (permissions == null || permissions.archive == false) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              "It appears that you do not have permission to archive an appointment, talk with one of the therapists in the process for more information.",
          })
        }
      }
    } else if (!(callerRole == "admin")) {
      // if not a therapist, nor an intern, nor an admin -> you're not supposed to be here
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to edit this appointment.",
      })
    }

    // archive the appointment
    await prisma.appointment.update({
      data: {
        active: false, // no longer active
        archived_date: req.body.archiveDate,
      },
      where: { slot_id: req.body.appointmentId },
    })

    return res.status(StatusCodes.OK).json({
      message: "The given appointment was successfuly archived.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getAllActiveAppointments(
  req: Request<{}, {}, AppointmentsList>,
  res: Response
) {
  /**
   * Returns all the active appointments of a therapist if a valid id is given or all from all the therapists if id = -1
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // prepare vars
    var isTherapist = false
    var isIntern = false
    var therapistId = -1
    var internId = -1

    console.log(req.body.filterId)

    if ((callerRole == "admin" || callerRole == "guard") && req.body.filterId != -1) {
      // the processes of the specified filterId
      // find out if the given id is from a therapist or an intern
      var userType = await getUserType(req.body.filterId)
      console.log(userType)
      switch (userType) {
        case "therapist":
          isTherapist = true
          therapistId = req.body.filterId
          break
        case "intern":
          isIntern = true
          internId = req.body.filterId
          break
        case "error":
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "The given id does not belong to a therapist nor an intern.",
          })
      }
    } else if (callerRole == "therapist") {
      isTherapist = true
      therapistId = req.body.filterId
    } else if (callerRole == "intern") {
      isIntern = true
      internId = req.body.filterId
    } else if (callerRole == "accountant") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to see this information.",
      })
    }

    // all appointments
    var processIds: Array<number> = []
    // get the ids of the processes of the specified user
    if (isTherapist) {
      var therapists_process = await prisma.therapist_process.findMany({
        where: { therapist_person_id: therapistId },
      })
      for (let i = 0; i < therapists_process.length; i++) {
        processIds.push(Number(therapists_process[i].process_id))
      }
    } else if (isIntern) {
      var interns_process = await prisma.intern_process.findMany({
        where: { intern_person_id: internId },
      })
      for (let i = 0; i < interns_process.length; i++) {
        // check see permission if the caller is an intern
        var permissions = await retrieveInternPermissions(
          internId,
          Number(interns_process[i].process_id)
        )
        if (permissions != null && permissions.see == true) {
          // if he can see, then add this process.
          processIds.push(Number(interns_process[i].process_id))
        }
      }
    }

    // get the processes
    var processes: any = []
    if ((callerRole == "admin" || callerRole == "guard") && req.body.filterId == -1) {
      // all processes
      processes = await prisma.process.findMany()
    } else {
      // either intern or therapist
      for (let i = 0; i < processIds.length; i++) {
        processes.push(
          await prisma.process.findFirst({
            where: { id: processIds[i] },
          })
        )
      }
    }

    var allAppointmentsInfo: any = []
    // get all the appointmentIds of every process
    var appointmentIds: Array<number> = []
    for (let i = 0; i < processes.length; i++) {
      // get the appointments of the processes[i]
      var appointment_process = await prisma.appointment_process.findMany({
        where: { process_id: processes[i].id },
      })
      // get the interns of the processes[i]
      var intern_process = await prisma.intern_process.findMany({
        where: { process_id: processes[i].id },
      })
      var interns: any = []
      for (let e = 0; e < intern_process.length; e++) {
        interns.push(
          await prisma.intern.findFirst({
            where: { person_id: intern_process[e].intern_person_id },
            include: { person: { select: { name: true } } },
          })
        )
      }

      // get the therapists of the processes[i]
      var therapist_process = await prisma.therapist_process.findMany({
        where: { process_id: processes[i].id },
      })
      var therapists: any = []
      var therapist
      for (let e = 0; e < therapist_process.length; e++) {
        therapist = await prisma.therapist.findFirst({
          where: { person_id: therapist_process[e].therapist_person_id },
          select: { person: { select: { name: true } } },
        })
        therapists.push(therapist?.person.name)
      }

      // get the patients of the processes[i]
      var patient_process = await prisma.patient_process.findMany({
        where: { process_id: processes[i].id },
      })
      var patients: any = []
      var patient
      for (let e = 0; e < patient_process.length; e++) {
        patient = await prisma.patient.findFirst({
          where: { person_id: patient_process[e].patient_person_id },
          select: { person: { select: { name: true } } },
        })
        patients.push(patient?.person.name)
      }

      for (let e = 0; e < appointment_process.length; e++) {
        appointmentIds.push(Number(appointment_process[e].appointment_slot_id))
        // obtain the appointment info
        var appointmentInfo = await prisma.appointment.findFirst({
          where: {
            slot_id: appointmentIds[e],
            active: true,
          },
          select: {
            online: true,
            slot_start_date: true,
            slot_end_date: true,
            room: { select: { name: true } },
          },
        })

        if (!appointmentInfo) {
          continue
        }

        if (callerRole == "guard") {
          allAppointmentsInfo.push({
            appointmentStartTime: appointmentInfo.slot_start_date,
            appointmentEndTime: appointmentInfo.slot_end_date,
            appointmentRoom: appointmentInfo.room.name,
            therapists: therapists,
          })
        } else {
          // build data for the current appointment
          allAppointmentsInfo.push({
            appointmentStartTime: appointmentInfo.slot_start_date,
            appointmentEndTime: appointmentInfo.slot_end_date,
            appointmentRoom: appointmentInfo.room.name,
            therapists: therapists,
            speciality: processes[i].speciality_speciality,
          })
        }
      }
    }

    return res.status(StatusCodes.OK).json({
      message: "[ ListActive ] It is working.",
      data: allAppointmentsInfo,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function lastTerminatedAppointments(req: Request, res: Response) {
  /**
   * Returns all the appointments that have been terminated in the last 24 hours if the caller is an accountant
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    if (callerRole != "accountant" && !callerIsAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to use this endpoint.",
      })
    }

    var dayInMilliseconds = 1000 * 60 * 60 * 24
    var now = Date.now()

    // obter a informação de cada appointment que foi arquivado nas ultimas 24 horas.
    var appointments = await prisma.appointment.findMany({
      where: { active: false },
      orderBy: { archived_date: "desc" },
    })
    var appointmentsLast24h = []
    for (let i = 0; i < appointments.length; i++) {
      let appointmentArchivedDate = appointments[i].archived_date
      if (appointmentArchivedDate != null) {
        var archivedDate = new Date(appointmentArchivedDate)
        if (archivedDate.getTime() <= now && archivedDate.getTime() >= now - dayInMilliseconds) {
          // if in the last 24 hours
          // get the info from each appointment
          var currentAppointment = appointments[i]
          var appointmentProcess = await prisma.appointment_process.findFirst({
            where: { appointment_slot_id: currentAppointment.slot_id },
          })

          // get patients for this process
          var patient_process = await prisma.patient_process.findMany({
            where: { process_id: appointmentProcess?.process_id },
          })
          var patients = [] // list of the names of the patients associated with the current process
          for (let e = 0; e < patient_process.length; e++) {
            patients.push(
              await prisma.person.findFirst({
                where: { id: patient_process[e].patient_person_id },
                select: { name: true },
              })
            )
          }
          // assemble appointment information (name of the patient, start and end dates of the appointment)
          appointmentsLast24h.push({
            patients: patients,
            appointmentStartTime: currentAppointment.slot_start_date,
            appointmentEndTime: currentAppointment.slot_end_date,
            appointmentArchivedDate: currentAppointment.archived_date,
          })
        }
      }
    }

    return res.status(StatusCodes.OK).json({
      data: appointmentsLast24h,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function onGoingAppointments(req: Request, res: Response) {
  /**
   * Returns all the on going appointments.
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // who can see this info???
    // TODO: check authorization

    // current time
    let now = Date.now()

    let onGoingAppointments = []
    // get all the appointments
    let appointments = await prisma.appointment.findMany({
      select: {
        online: true,
        room: {
          select: { name: true },
        },
        pricetable_id: true,
        slot_start_date: true,
        slot_end_date: true,
        archived_date: true,
      },
    })
    for (let i = 0; i < appointments.length; i++) {
      let startDate = new Date(appointments[i].slot_start_date)
      let startTime = startDate.getTime()
      let archivedDate = appointments[i].archived_date
      // filter the appointments
      console.log(appointments[i])
      if (startTime < now && archivedDate == null) {
        // on going appointment (it started but is yet to be completed.)
        onGoingAppointments.push(await getAppointmentInformation(appointments[i], false))
      }
    }

    res.status(StatusCodes.OK).json({
      data: onGoingAppointments,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

async function getUserType(id: number) {
  var therapist = await prisma.therapist.findFirst({
    where: { person_id: id },
  })
  if (therapist) return "therapist"
  var intern = await prisma.intern.findFirst({
    where: { person_id: id },
  })
  if (intern) return "intern"
  return "error"
}

async function retrieveInternPermissions(internId: number, processId: number) {
  /*
   * Returns the permissions of an intern for this scope.
   */

  var permissions = await prisma.permissions.findFirst({
    where: { process_id: processId, person_id: internId },
    select: {
      see: true,
      appoint: true,
      archive: true,
    },
  })
  return permissions
}

async function getAppointmentInformation(appointment: any, needsSpeciality: boolean) {
  // get the process
  var appointment_process = await prisma.appointment_process.findFirst({
    where: { appointment_slot_id: appointment.slot_id },
  })
  if (appointment_process == null) {
    return
  }
  var processId = appointment_process.process_id
  // get the therapists name
  var therapist_process = await prisma.therapist_process.findMany({
    where: { process_id: processId },
  })
  var therapists = []
  for (let i = 0; i < therapist_process.length; i++) {
    therapists.push(
      await prisma.person.findFirst({
        where: { id: therapist_process[i].therapist_person_id },
        select: { name: true },
      })
    )
  }
  // get the patients name
  var patient_process = await prisma.patient_process.findMany({ where: { process_id: processId } })
  var patients = []
  for (let i = 0; i < patient_process.length; i++) {
    patients.push(
      await prisma.person.findFirst({
        where: { id: patient_process[i].patient_person_id },
        select: { name: true },
      })
    )
  }
  // get the interns name
  var intern_process = await prisma.intern_process.findMany({ where: { process_id: processId } })
  var interns = []
  for (let i = 0; i < intern_process.length; i++) {
    interns.push(
      await prisma.person.findFirst({
        where: { id: intern_process[i].intern_person_id },
        select: { name: true },
      })
    )
  }

  if (needsSpeciality) {
    // get the process in order to get the speciality
    var process = await prisma.process.findFirst({ where: { id: processId } })

    return {
      appointmentStartTime: appointment.slot_start_date,
      appointmentEndTime: appointment.slot_end_date,
      appointmentArchivedDate: appointment.archived_date,
      appointmentRoom: appointment.room.name,
      therapists: therapists,
      speciality: process?.speciality_speciality,
    }
  }

  // return the info
  return {
    appointmentStartTime: appointment.slot_start_date,
    appointmentEndTime: appointment.slot_end_date,
    appointmentArchivedDate: appointment.archived_date,
    appointmentRoom: appointment.room.name,
    therapists: therapists,
  }
}

async function listAppointmentsOfNextDays(req: Request, res: Response) {
  /**
   * Returns all the appointments of the current day for the calling therapist, intern or guard
   */
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerRole = decodedToken.role
    var callerId = decodedToken.id

    if (callerRole == "acountant") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have access to this information.",
      })
    }

    var appointmentsOfNextDays = []
    var today = new Date()
    today.setHours(0, 0, 0, 0)
    var process_user = null

    if (callerRole == "guard" || callerRole == "admin") {
      // return all the appointments of the day
      var appointments = await prisma.appointment.findMany({
        select: {
          slot_start_date: true,
          slot_end_date: true,
          slot_id: true,
          room: { select: { name: true } },
        },
      })

      // filter the appointments of the current day
      for (let i = 0; i < appointments.length; i++) {
        var tempDate = new Date(appointments[i].slot_start_date)
        tempDate.setHours(0, 0, 0, 0)
        if (tempDate.getTime() > today.getTime()) {
          appointmentsOfNextDays.push(await getAppointmentInformation(appointments[i], false))
        }
      }
    } else {
      if (callerRole == "therapist") {
        // get the processes of the asking therapist (caller)
        process_user = await prisma.therapist_process.findMany({
          where: { therapist_person_id: callerId },
        })
      } else if (callerRole == "intern") {
        // get the processes of the asking intern (caller)
        process_user = await prisma.intern_process.findMany({
          where: { intern_person_id: callerId },
        })
      }
      if (process_user != null) {
        for (let i = 0; i < process_user.length; i++) {
          var appointment_process = await prisma.appointment_process.findMany({
            where: { process_id: process_user[i].process_id },
          })
          for (let e = 0; e < appointment_process.length; e++) {
            // get the appointment
            var appointment = await prisma.appointment.findFirst({
              where: { slot_id: appointment_process[e].appointment_slot_id },
              select: {
                slot_start_date: true,
                slot_end_date: true,
                slot_id: true,
                room: { select: { name: true } },
              },
            })

            if (appointment == null) {
              continue
            }
            var tempDate = new Date(appointment.slot_start_date)
            // filter by the current day
            tempDate.setHours(0, 0, 0, 0)
            if (tempDate.getTime() >= today.getTime()) {
              appointmentsOfNextDays.push(await getAppointmentInformation(appointment, true))
            }
          }
        }
      }
    }

    // return info
    res.status(StatusCodes.OK).json({
      message: "It is working.",
      data: appointmentsOfNextDays,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function createReceipt(req: Request<{ appointmentId: string }>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  const appointmentId = req.params.appointmentId

  try {
    // Fetch Appointment
    const appointment = await prisma.appointment_process.findFirst({
      where: { appointment: { slot_id: Number(appointmentId) } },
    })

    // Check If It Exists
    if (appointment === null || appointment === undefined) {
      logger.info(`RECEIPT [user-id: ${id}] => Appointment does not exist.`)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Appointment with id '${appointmentId} does not exist...`,
      })
    }

    // Check Permissions (Admin access is always granted)
    if (!admin) {
      let access = false
      if (role == User.THERAPIST) {
        // Grant access if therapist belongs to the process
        const process = await prisma.therapist_process.findUnique({
          where: {
            therapist_person_id_process_id: {
              therapist_person_id: id,
              process_id: appointment.process_id,
            },
          },
        })
        if (process !== null && process !== undefined) {
          access = true
        }
      } else if (role === User.INTERN) {
        // Grant access if intern belongs to the current process and has `archive` permissions.
        const process = await prisma.intern_process.findUnique({
          where: {
            intern_person_id_process_id: {
              intern_person_id: id,
              process_id: appointment.process_id,
            },
          },
        })
        const permissions = await prisma.permissions.findUnique({
          where: { id: id },
        })
        assert(permissions !== null)
        if (process !== null && process !== undefined && permissions.archive) {
          access = true
        }
      }

      if (!access) {
        logger.info(
          `RECEIPT [user-id: ${id}] => Authorization to create receipt revoked (insufficient permissions)`
        )
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Receipt Creation Failed (insufficient permissions)",
        })
      }
    }
    logger.info(`RECEIPT [user-id: ${id}] => Authorization to create receipt granted...`)

    // Create Receipt
    logger.debug(`RECEIPT [user-id: ${id}] => Generating Receipt...`)
    await prisma.receipt.create({
      data: { appointment_slot_id: Number(appointmentId) },
    })

    logger.debug(`RECEIPT [user-id: ${id}] => Receipt Created Successfully...`)
    res.status(StatusCodes.OK).json({
      message: "Receipt Created Successfully",
    })
  } catch (error) {
    logger.error(`RECEIPT => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getReceipt(req: Request<{ appointmentId: string }>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  const appointmentId = req.params.appointmentId

  try {
    // Fetch Appointment
    const appointment_process = await prisma.appointment_process.findFirst({
      where: { appointment: { slot_id: Number(appointmentId) } },
    })

    // Check If It Exists
    if (appointment_process === null || appointment_process === undefined) {
      logger.info(`RECEIPT [user-id: ${id}] => Appointment does not exist.`)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Appointment with id '${appointmentId} does not exist...`,
      })
    }

    // Check Permissions (Admin and Accountant access is always granted)
    if (!admin && role !== User.ACCOUNTANT) {
      let access = false
      if (role == User.THERAPIST) {
        // Grant access if therapist belongs to the process
        const process = await prisma.therapist_process.findUnique({
          where: {
            therapist_person_id_process_id: {
              therapist_person_id: id,
              process_id: appointment_process.process_id,
            },
          },
        })
        if (process !== null && process !== undefined) {
          access = true
        }
      } else if (role === User.INTERN) {
        // Grant access if intern belongs to the current process and has `archive` permissions.
        const process = await prisma.intern_process.findUnique({
          where: {
            intern_person_id_process_id: {
              intern_person_id: id,
              process_id: appointment_process.process_id,
            },
          },
        })
        const permissions = await prisma.permissions.findUnique({
          where: { id: id },
        })
        assert(permissions !== null)
        if (process !== null && process !== undefined && permissions.see) {
          access = true
        }
      }

      // Grant Access
      if (!access) {
        logger.info(
          `RECEIPT [user-id: ${id}] => Authorization to fetch receipt revoked (insufficient permissions)`
        )
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Receipt Creation Failed (insufficient permissions)",
        })
      }
    }
    logger.info(`RECEIPT [user-id: ${id}] => Authorization to fetch receipt granted...`)

    // Fetch Receipt
    logger.debug(`RECEIPT [user-id: ${id}] => Retrieving Receipt...`)

    // Build Receipt
    const payload = await buildReceipt(Number(appointmentId))
    if (payload === null) {
      logger.info(`RECEIPT [user-id: ${id}] => Receipt does not exist.`)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Receipt does not exist (not generated yet)`,
      })
    }

    logger.debug(`RECEIPT [user-id: ${id}] => Receipt Retrieved Successfully...`)
    res.status(StatusCodes.OK).json({
      message: "Receipt Retrieved Successfully",
      data: payload,
    })
  } catch (error) {
    logger.error(`RECEIPT => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  getAllAppointments,
  createAppointment,
  infoAppointment,
  editAppointment,
  archiveAppointment,
  getAllActiveAppointments,
  lastTerminatedAppointments,
  listAppointmentsOfTheDay,
  onGoingAppointments,
  listAppointmentsOfNextDays,
  getReceipt,
  createReceipt,
}
