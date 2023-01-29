import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { verifyAccessToken, verifyToken } from "../services/auth.service"
import {
  ProcessCreateBody,
  ProcessEditBody,
  ProcessEditPermissionsBody,
  ProcessIDPrams,
  QueryListProcess,
  NotesCreateBody,
  GetCollaboratorsBody,
} from "../utils/types"
import logger from "../utils/logger"

export async function archive(req: Request<ProcessIDPrams, {}, {}>, res: Response) {
  try {
    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (decoded.admin == false || permissions!.archive == false) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    await prisma.process.update({
      data: { active: false },
      where: { id: processId },
    })

    return res.status(StatusCodes.OK).json({
      message: "Process Archived!",
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function info(req: Request<ProcessIDPrams, {}, {}>, res: Response) {
  try {
    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (decoded.admin == false || permissions!.see == false) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    var therapists = await prisma.therapist_process.findMany({
      where: {
        process_id: processId,
      },
    })

    var colaborators: string[] = []
    var mainTherapistId
    var mainTherapistName

    var flag = false
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
            process_id: processId,
          },
        })

        if (permissions?.isMain) {
          mainTherapistId = therapist.therapist_person_id;
          mainTherapistName = person?.name;
        } else {
          colaborators.push(person!.name + " (terapeuta)")
        }
      }

      colaborators.push(person!.name + " (terapeuta)")
    }

    var process = await prisma.process.findUnique({
      where: {
        id: processId,
      },
    })

    var processRef = process?.ref

    var interns = await prisma.intern_process.findMany({
      where: {
        process_id: processId,
      },
    })

    for (let intern of interns) {
      var internName = await prisma.person.findUnique({
        where: {
          id: intern.intern_person_id,
        },
      })
      colaborators.push(internName!.name + " (Em estágio)")
    }

    var utent = await prisma.patient_process.findFirst({
      where: {
        process_id: processId,
      },
    })

    var utentName = await prisma.person.findFirst({
      where: {
        id: utent?.patient_person_id,
      },
    })

    var apointments = await prisma.appointment_process.findMany({
      where: {
        process_id: processId,
      },
    })

    var isPayed = true

    for (let apointment of apointments) {
      var receipt = await prisma.receipt.findFirst({
        where: {
          appointment_slot_id: apointment.appointment_slot_id,
        },
      })
      if (receipt!.payed == false) {
        isPayed = false
      }
    }

    return res.status(StatusCodes.OK).json({
      therapistId: mainTherapistId,
      therapistName: mainTherapistName,
      ref: processRef,
      colaborators: colaborators,
      utent: utentName?.name,
      active: process?.active,
      financialSituation: isPayed,
      speciality: process?.speciality_speciality,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request<{}, {}, {}, QueryListProcess>, res: Response) {
  try {
    var queryParams = req.query

    if (queryParams.active == null) {
      queryParams.active = "true"
    }
    var active = queryParams.active === "true"

    if (queryParams.speciality == null) {
      var processes = await prisma.process.findMany({
        where: {
          active: active,
        },
      })
    } else {
      var processes = await prisma.process.findMany({
        where: {
          active: active,
          speciality_speciality: queryParams.speciality,
        },
      })
    }

    var listing: any = []

    for (var process of processes) {
      var therapists = await prisma.therapist_process.findMany({
        where: {
          process_id: process.id,
        },
      })

      var therapistListing: string[] = []

      for (var therapist_process of therapists) {
        var therapist = await prisma.person.findUnique({
          where: {
            id: therapist_process.therapist_person_id,
          },
        })

        therapistListing.push(therapist!.name)
      }

      var ref = process.ref

      var utentProcess = await prisma.patient_process.findFirst({
        where: {
          process_id: process.id,
        },
      })

      var utentName = await prisma.person.findUnique({
        where: {
          id: utentProcess?.patient_person_id,
        },
      })

      var appointments = await prisma.appointment_process.findMany({
        where: {
          process_id: process.id,
        },
      })

      var nextAppointment = Date.now()
      var dateChanged = false

      for (var appointmentProcess of appointments) {
        var apointment = await prisma.appointment.findUnique({
          where: {
            slot_id: appointmentProcess.appointment_slot_id,
          },
        })

        if (apointment!.slot_start_date.getTime() > nextAppointment) {
          nextAppointment = apointment!.slot_start_date.getTime()
          dateChanged = true
        }
      }

      var nextAppointmentString: string = ""
      if (dateChanged) {
        nextAppointmentString = new Date(nextAppointment).toString()
      } else {
        nextAppointmentString = "No next Appointment"
      }

      var speciality = await prisma.speciality.findFirst({
        where: {
          speciality: process.speciality_speciality,
        },
      })

      listing.push({
        therapistListing: therapistListing,
        patientName: utentName?.name,
        refCode: ref,
        nextAppointment: nextAppointmentString,
        speciality: speciality?.speciality,
      })
    }
    return res.status(StatusCodes.OK).json({
      list: listing,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function listTherapist(req: Request, res: Response) {
  try {
    var decoded = res.locals.token

    var processes = await prisma.therapist_process.findMany({
      where: {
        therapist_person_id: decoded.id,
      },
    })

    var listing: any = []

    for (var processInfo of processes) {
      var process = await prisma.process.findUnique({
        where: {
          id: processInfo.process_id,
        },
      })

      var ref = process?.ref

      var utentProcess = await prisma.patient_process.findFirst({
        where: {
          process_id: process?.id,
        },
      })

      var utentName = await prisma.person.findUnique({
        where: {
          id: utentProcess?.patient_person_id,
        },
      })

      var appointments = await prisma.appointment_process.findMany({
        where: {
          process_id: process?.id,
        },
      })

      var nextAppointment = Date.now()
      var dateChanged = false

      for (var appointmentProcess of appointments) {
        var apointment = await prisma.appointment.findUnique({
          where: {
            slot_id: appointmentProcess.appointment_slot_id,
          },
        })

        if (apointment!.slot_start_date.getTime() > nextAppointment) {
          nextAppointment = apointment!.slot_start_date.getTime()
          dateChanged = true
        }
      }

      var nextAppointmentString: string = ""
      if (dateChanged) {
        nextAppointmentString = new Date(nextAppointment).toString()
      } else {
        nextAppointmentString = "No next Appointment"
      }

      var speciality = await prisma.speciality.findFirst({
        where: {
          speciality: process?.speciality_speciality,
        },
      })

      var therapists = await prisma.therapist_process.findMany({
        where: {
          process_id: process?.id,
        },
      })

      let therapistsNames = []
      for (var therapist of therapists) {
        let therapistInfo = await prisma.person.findUnique({
          where: {
            id: therapist.therapist_person_id,
          },
        })

        therapistsNames.push(therapistInfo?.name)
      }

      listing.push({
        id: process?.id,
        patientName: utentName?.name,
        refCode: ref,
        nextAppointment: nextAppointmentString,
        speciality: speciality?.speciality,
        therapistListing: therapistsNames,
        //active: process?.active ? "ativo" : "inativo"
        active: process?.active,
      })
    }

    var tName = await prisma.person.findUnique({
      where: {
        id: decoded.id,
      },
    })
    return res.status(StatusCodes.OK).json({
      list: listing,
      therapist: tName?.name,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function activate(req: Request<ProcessIDPrams, {}, {}>, res: Response) {
  try {
    // Fetch and decoded the verification token
    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    //Falta saber se o user é admin ou n
    if (decoded.admin == false) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Not authorized",
      })
    }

    await prisma.process.update({
      data: { active: true },
      where: { id: processId },
    })
    return res.status(StatusCodes.OK).json({
      message: "Process Activated!",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function create(req: Request<{}, {}, ProcessCreateBody>, res: Response) {
  try {
    var decoded = res.locals.token

    var admin = false
    //FALTA CRIAR NOTIFICACAO
    if (decoded.admin == false) {
      admin = true
    }

    var ref = (Math.random() + 1).toString(36).substring(7) //isto ta a fazer random, depois mudar i guess

    var process = await prisma.process.create({
      data: {
        active: admin,
        ref: ref,
        remarks: req.body.remarks,
        speciality_speciality: req.body.speciality,
      },
    })

    await prisma.therapist_process.create({
      data: {
        therapist_person_id: req.body.therapistId,
        process_id: process.id,
      },
    })

    await prisma.permissions.create({
      data: {
        editpatitent: true,
        see: true,
        appoint: true,
        statitics: true,
        editprocess: true,
        isMain: true,
        process_id: process.id,
        person_id: req.body.therapistId,
      },
    })

    for (let patientId of req.body.patientIds) {
      await prisma.patient_process.create({
        data: {
          patient_person_id: patientId,
          process_id: process.id,
        },
      })
    }

    for (let collaboratorId of req.body.colaborators) {
      var type = await prisma.intern.findUnique({
        where: {
          person_id: collaboratorId,
        },
      })

      if (type != null) {
        //é interno
        await prisma.intern_process.create({
          data: {
            process_id: process.id,
            intern_person_id: collaboratorId,
          },
        })
      } else {
        //é terapeuta
        await prisma.therapist_process.create({
          data: {
            process_id: process.id,
            therapist_person_id: collaboratorId,
          },
        })
      }

      await prisma.permissions.create({
        data: {
          process_id: process.id,
          person_id: collaboratorId,
        },
      })
    }

    return res.status(StatusCodes.OK).json({
      message: "Process Created!",
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function edit(req: Request<ProcessIDPrams, {}, ProcessEditBody>, res: Response) {
  try {
    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (decoded.admin == false || permissions!.see == false) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    let permissionMainTherapist = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        isMain: true,
      },
    })

    await prisma.permissions.delete({
      where: {
        id: permissionMainTherapist?.id,
      },
    })

    await prisma.therapist_process.deleteMany({
      where: {
        therapist_person_id: permissionMainTherapist?.person_id,
        process_id: permissionMainTherapist?.id,
      },
    })

    await prisma.therapist_process.create({
      data: {
        process_id: processId,
        therapist_person_id: req.body.therapistId,
      },
    })

    await prisma.permissions.create({
      data: {
        editpatitent: true,
        see: true,
        appoint: true,
        statitics: true,
        editprocess: true,
        isMain: true,
        process_id: processId,
        person_id: req.body.therapistId,
      },
    })

    await prisma.process.update({
      where: {
        id: processId,
      },
      data: {
        speciality_speciality: req.body.speciality,
      },
    })

    for (let colaboratorId of req.body.colaborators) {
      var type = await prisma.intern.findUnique({
        where: {
          person_id: colaboratorId,
        },
      })

      if (type != null) {
        //é interno
        await prisma.intern_process.create({
          data: {
            process_id: processId,
            intern_person_id: colaboratorId,
          },
        })
      } else {
        //é terapeuta
        await prisma.therapist_process.create({
          data: {
            process_id: processId,
            therapist_person_id: colaboratorId,
          },
        })
      }

      await prisma.permissions.create({
        data: {
          process_id: processId,
          person_id: colaboratorId,
        },
      })
    }

    return res.status(StatusCodes.OK).json({
      message: "Edit done!",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function appointments(req: Request<ProcessIDPrams, {}, {}>, res: Response) {
  try {
    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    var appointments = await prisma.appointment_process.findMany({
      where: {
        process_id: processId,
      },
    })

    var infoAppointments = []

    for (var appointmentProcess of appointments) {
      var apointment = await prisma.appointment.findUnique({
        where: {
          slot_id: appointmentProcess.appointment_slot_id,
        },
      })

      var room = await prisma.room.findUnique({
        where: {
          id: apointment?.room_id,
        },
      })

      var type = await prisma.pricetable.findUnique({
        where: {
          id: apointment?.pricetable_id,
        },
      })

      let date = apointment?.slot_start_date
      const formattedDate = date?.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

      let receipt = await prisma.receipt.findFirst({
        where: {
          appointment_slot_id: apointment?.slot_id,
        },
      })

      infoAppointments.push({
        data: formattedDate,
        estado: receipt?.payed ? "Pago" : "Por Pagar",
        referencia: receipt != null ? receipt.ref : "",
        valor: type?.price,
      })
    }

    return res.status(StatusCodes.OK).json({
      message: infoAppointments,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function editPermissions(
  req: Request<ProcessIDPrams, {}, ProcessEditPermissionsBody>,
  res: Response
) {
  try {
    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (decoded.admin == false || permissions!.editprocess == false) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    var permission = await prisma.permissions.findFirst({
      where: {
        person_id: req.body.collaboratorId,
        process_id: processId,
      },
    })

    await prisma.permissions.update({
      where: {
        id: permission?.id,
      },
      data: {
        editprocess: req.body.editProcess,
        see: req.body.see,
        appoint: req.body.appoint,
        statitics: req.body.statitics,
        editpatitent: req.body.editPatient,
        archive: req.body.archive,
      },
    })

    return res.status(StatusCodes.OK).json({
      message: "Permission updated",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function createNote(req: Request<ProcessIDPrams, {}, NotesCreateBody>, res: Response) {
  try {
    var date = new Date()
    var processId = parseInt(req.params.processId)

    await prisma.notes.create({
      data: {
        datetime: date,
        title: req.body.title,
        body: req.body.title,
        process_id: processId,
      },
    })

    return res.status(StatusCodes.OK).json({
      message: "Note Created",
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function listNotes(req: Request, res: Response) {
  try {
    var date = new Date()
    var processId = parseInt(req.params.processId)

    var notes = await prisma.notes.findMany({
      where: {
        process_id: processId,
      },
    })

    var list = []

    for (let note of notes) {
      let date = note.datetime
      let formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      list.push({ title: note.title, body: note.body, date: formattedDate })
    }

    return res.status(StatusCodes.OK).json({
      message: list,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getPermissions(req: Request, res: Response) {
  try {
    var processId = parseInt(req.params.processId)

    var permissions = await prisma.permissions.findMany({
      where: {
        process_id: processId,
      },
    })

    let permissionsInfo = []
    for (let permission of permissions) {
      var userInfo = await prisma.person.findUnique({
        where: {
          id: permission.person_id,
        },
      })

      permissionsInfo.push({
        collaboratorId: permission.person_id,
        appoint: permission.appoint,
        statistics: permission.statitics,
        editProcess: permission.editprocess,
        editPatient: permission.editpatitent,
        archive: permission.archive,
        see: permission.see,
        processId: permission.process_id,
        name: userInfo?.name,
      })
    }

    res.status(StatusCodes.OK).json({
      message: permissionsInfo,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getCollaborators(req: Request<{}, {}, GetCollaboratorsBody>, res: Response) {
  /**
   * Returns info of all the collaborators of the process;
   */

  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // get the info from the request body
    let processId = req.body.processId

    let canSee = false

    // check permission therapist
    if (callerRole == "therapist") {
      let therapist_process = await prisma.therapist_process.findFirst({
        where: { therapist_person_id: callerId, process_id: processId },
      })
      if (therapist_process != null) {
        canSee = true
      }
    }
    // check permission intern
    else if (callerRole == "intern") {
      let permission = await prisma.permissions.findFirst({
        where: { person_id: callerId, process_id: processId },
      })
      if (permission != null && permission.see) {
        canSee = true
      }
    }

    if (!callerIsAdmin && !canSee) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You don't have what it takes to wield this power!",
      })
    }

    // get the therapists of the process
    let therapist_process = await prisma.therapist_process.findMany({
      where: { process_id: processId },
    })
    let therapistsInfo = []
    for (let i = 0; i < therapist_process.length; i++) {
      let person = await prisma.person.findFirst({
        where: { id: therapist_process[i].therapist_person_id },
      })
      therapistsInfo.push({
        id: person?.id,
        name: person?.name,
      })
    }

    // get the interns of the process
    let intern_process = await prisma.intern_process.findMany({ where: { process_id: processId } })
    let internsInfo = []
    for (let i = 0; i < intern_process.length; i++) {
      let person = await prisma.person.findFirst({
        where: { id: intern_process[i].intern_person_id },
      })
      internsInfo.push({
        id: person?.id,
        name: person?.name,
      })
    }

    let infoToReturn = {
      therapists: therapistsInfo,
      interns: internsInfo,
    }

    res.status(StatusCodes.OK).json({
      data: infoToReturn,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  archive,
  info,
  list,
  create,
  activate,
  edit,
  appointments,
  editPermissions,
  createNote,
  listNotes,
  listTherapist,
  getPermissions,
  getCollaborators,
}
