import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import {
  AppointmentArchive,
  AppointmentCreate,
  AppointmentsList,
  AppointmentInfo,
  AppointmentEdit,
} from "../utils/types"

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
      therapistId = req.body.filterId
    } else if (callerRole == "intern") {
      isIntern = true
      internId = req.body.filterId
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
        patients.push(
          await prisma.patient.findFirst({
            where: { person_id: patient_process[e].patient_person_id },
            select: {
              health_number: true,
              request: true,
              remarks: true,
              person: {
                select: {
                  name: true,
                  email: true,
                  address: true,
                  birth_date: true,
                  phone_number: true,
                },
              },
              patienttype: {
                select: { type: true },
              },
              profession: {
                select: { name: true },
              },
              school: {
                select: {
                  grade: true,
                  name: true,
                  course: true,
                },
              },
            },
          })
        )
      }

      for (let e = 0; e < appointment_process.length; e++) {
        appointmentIds.push(Number(appointment_process[e].appointment_slot_id))
        // obtain the appointment info
        var appointmentInfo = await prisma.appointment.findFirst({
          where: { slot_id: appointmentIds[e] },
          select: {
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

        if (!appointmentInfo) {
          continue
        }

        if (callerRole == "guard") {
          allAppointmentsInfo.push({
            appointmentStartTime: appointmentInfo.slot_start_date,
            appointmentEndTime: appointmentInfo.slot_end_date,
            appointmentRoom: appointmentInfo.room.name,
            //appointment: appointmentInfo,
            therapists: therapists,
            //interns: interns,
            //patients: patients,
            //process: processes[i]
          })
        } else {
          // build data for the current appointment
          allAppointmentsInfo.push({
            appointmentStartTime: appointmentInfo.slot_start_date,
            appointmentEndTime: appointmentInfo.slot_end_date,
            appointmentRoom: appointmentInfo.room.name,
            //appointment: appointmentInfo,
            therapists: therapists,
            //interns: interns,
            //patients: patients,
            //process: processes[i]
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

    if (callerRole == "accountant") {
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
          // get the appointments
          appointmentsOfToday.push(getAppointmentInformation(appointments[i], false))
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
              appointmentsOfToday.push(getAppointmentInformation(appointment, true))
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
    var appointment = await prisma.appointment.create({
      data: {
        online: req.body.online,
        slot_start_date: req.body.startDate,
        slot_end_date: req.body.endDate,
        archived_date: req.body.archiveDate,
        pricetable: {
          connect: { id: req.body.priceTableId },
        },
        room: {
          connect: { id: req.body.roomId },
        },
      },
    })

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
    // var isGuard: boolean = callerRole == "guard" ? true : false

    // get the appointment info
    var appointment = await prisma.appointment.findFirst({
      where: { slot_id: req.body.appointmentId },
      select: {
        slot_start_date: true,
        slot_end_date: true,
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
    // get the terapists
    var therapists: any = []
    var therapist
    var therapist_process = await prisma.therapist_process.findMany({
      where: { process_id: process.id },
    })
    if (therapist_process.length == 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "It appears that there are no therapits assigned to this process.",
      })
    }
    for (let i = 0; i < therapist_process.length; i++) {
      therapist = await prisma.therapist.findFirst({
        where: { person_id: therapist_process[i].therapist_person_id },
        select: { person: { select: { name: true } } },
      })
      therapists.push(therapist?.person.name)
      if (callerId == Number(therapist_process[i].therapist_person_id)) {
        isProcessTherapist = true
      }
    }
    //get the interns
    var interns: any = []
    var intern
    var intern_process = await prisma.intern_process.findMany({
      where: { process_id: process.id },
    })
    for (let i = 0; i < intern_process.length; i++) {
      intern = await prisma.intern.findFirst({
        where: { person_id: intern_process[i].intern_person_id },
        select: { person: { select: { name: true } } },
      })
      interns.push(intern?.person.name)
      if (callerId == Number(intern_process[i].intern_person_id)) {
        // get the permissions of this intern for this process
        var permissions = await retrieveInternPermissions(callerId, Number(process.id))
        if (permissions != null && permissions.see) {
          isProcessIntern = true // this means that the caller is an intern that is associated with the process and the see permission has been granted
        }
      }
    }

    // verify if the caller has the right permissions
    if (!(callerIsAdmin || isProcessTherapist || isProcessIntern)) {
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

    res.status(StatusCodes.OK).json({
      message: "It is working.",
      appointmentStartTime: appointment.slot_start_date,
      appointmentEndTime: appointment.slot_end_date,
      appointmentRoom: appointment.room.name,
      //appointment: appointmentInfo,
      therapists: therapists,
      interns: interns,
      patients: patients,
      //process: processes[i]
      speciality: process.speciality_speciality,
      processRef: process.ref,
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

    if (callerRole != "accountant") {
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
      var archivedDate = new Date(appointments[i].archived_date)
      if (archivedDate.getTime() > now - dayInMilliseconds) {
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

    return res.status(StatusCodes.OK).json({
      data: appointmentsLast24h,
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
      appointmentRoom: appointment.room.name,
      therapists: therapists,
      speciality: process?.speciality_speciality,
    }
  }

  // return the info
  return {
    appointmentStartTime: appointment.slot_start_date,
    appointmentEndTime: appointment.slot_end_date,
    appointmentRoom: appointment.room.name,
    therapists: therapists,
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
}
