import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { verifyAccessToken } from "../services/auth.service"

import {
  AppointmentArchive,
  AppointmentCreate,
  AppointmentsList,
  AppointmentInfo,
  AppointmentEdit,
  AccessToken,
} from "../utils/types"

export async function getAllAppointments(req: Request<{}, {}, AppointmentsList>, res: Response) {
  /**
   * Returns all the appointments of a therapist if a valid id is given, or all if the id value is "-1"
   */

  // verify the token
  var decodedToken = verifyAccessToken<AccessToken>(req.body.token)
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
      processIds.push(Number(interns_process[i].process_id))
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
}

export async function createAppointment(req: Request<{}, {}, AppointmentCreate>, res: Response) {
  /**
   * Creates an appointment
   */

  // verify the token
  var decodedToken = verifyAccessToken<AccessToken>(req.body.token)
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
      slot_id: 3, // TODO: Isto tem de ser incrementado automaticamente!!
      slot_start_date: req.body.startDate,
      slot_end_date: req.body.endDate,
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
}

export async function infoAppointment(req: Request<{}, {}, AppointmentInfo>, res: Response) {
  /**
   * returns the info of an appointment
   */

  // verify the token
  var decodedToken = verifyAccessToken<AccessToken>(req.body.token)
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
      isProcessIntern = true
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
}

export async function editAppointment(req: Request<{}, {}, AppointmentEdit>, res: Response) {
  /**
   * edits the properties of an appointment
   */

  // verify the token
  var decodedToken = verifyAccessToken<AccessToken>(req.body.token)
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
}

export async function archiveAppointment(req: Request<{}, {}, AppointmentArchive>, res: Response) {
  /**
   * archives an appointment
   */

  // verify the token
  var decodedToken = verifyAccessToken<AccessToken>(req.body.token)
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
      // active: true, // TODO: descomentar depois de se ter criado este campo na tabela appointment
    },
    where: { slot_id: req.body.appointmentId },
  })

  return res.status(StatusCodes.OK).json({
    message: "The given appointment was successfuly archived.",
  })
}

export async function getAllActiveAppointments(
  req: Request<{}, {}, AppointmentsList>,
  res: Response
) {
  /**
   * Returns all the active appointments of a therapist if a valid id is given or all from all the therapists if id = -1
   */

  // verify the token
  var decodedToken = verifyAccessToken<AccessToken>(req.body.token)
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
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
      processIds.push(Number(interns_process[i].process_id))
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
          //active: true, //TODO: adicionar este campo à tabela appointment
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

  res.status(StatusCodes.OK).json({
    message: "[ ListActive ]It is working.",
    data: allAppointmentsInfo,
  })
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

export default {
  getAllAppointments,
  createAppointment,
  infoAppointment,
  editAppointment,
  archiveAppointment,
  getAllActiveAppointments,
}
