import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import {
  ProcessCreateBody,
  ProcessEditBody,
  ProcessEditPermissionsBody,
  ProcessIDPrams,
  QueryListProcess,
  NotesCreateBody,
  GetCollaboratorsBody,
  ProcessMigrationSchemaBody,
  UpdateNoteBody,
} from "../utils/types"
import logger from "../utils/logger"
import { User } from "../utils/schemas"
import assert from "assert"
import appointment from "../routes/appointment.route"
import { buildReceipt } from "../services/receipt.service"

/**
 * Migrates a process from a therapist to another.
 * The current therapist remains as a collaborator of the process.
 * The new becomes the main therapist.
 *  If the new is already a collaborator in the process, simply make him main therapist
 *  else, add the new as a therapist in the process and mak him main therapist.
 */
export async function migrate(
  req: Request<{ processId: string }, {}, ProcessMigrationSchemaBody>,
  res: Response
) {
  // Authorize User
  const { id, role, admin } = res.locals.token
  const processId = Number(req.params.processId)

  try {
    // Prepare Information
    const newId = req.body.therapistId
    const old = await prisma.permissions.findFirst({
      where: { isMain: true, process_id: processId },
    })
    const oldId = old?.person_id
    logger.info(`MIGRATE [${oldId} -> ${newId}] => Operation Approved! Initiating Migration...`)

    // Check if current user has permissions for executing the migration
    const permissions = await prisma.permissions.findFirst({
      where: { person_id: id, process_id: processId },
    })

    if (!admin && !permissions?.editprocess) {
      logger.info(`MIGRATE [${oldId} -> ${newId}] => Migration Failed! User lacks authorization`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization to execute this operation",
      })
    }

    // Check if `newId` is a Therapist
    if (await prisma.therapist.findUnique({ where: { person_id: newId } })) {
      logger.debug(`MIGRATE [${oldId} -> ${newId}] => Migrating process...`)

      // Perform Migration
      await prisma.permissions.updateMany({
        where: { person_id: oldId, process_id: processId },
        data: { isMain: false }, // remove isMain from the previous main therapist
      })

      // check if the new therapist is associated with the process already
      if (
        await prisma.therapist_process.findFirst({
          where: { therapist_person_id: newId, process_id: processId },
        })
      ) {
        // if already associated with the process, simply change the permission to isMain = true
        await prisma.permissions.updateMany({
          where: { person_id: newId, process_id: processId },
          data: { isMain: true },
        })
      } else {
        // add the therapist to the process
        await prisma.therapist_process.create({
          data: { therapist_person_id: newId, process_id: processId },
        })
        // create the permissions in the process for this therapist
        await prisma.permissions.create({
          data: {
            person_id: newId,
            process_id: processId,
            editprocess: true,
            see: true,
            appoint: true,
            statitics: true,
            editpatitent: true,
            archive: true,
            isMain: true, // make him the main therapist
          },
        })
      }
      // Migration Successful
      logger.debug(`MIGRATE [${oldId} -> ${newId}] => Process Migrated Successfully!`)
      return res.status(StatusCodes.OK).json({
        message: "Process Migrated Successfully!",
      })
    }
    logger.info(
      `MIGRATE [${oldId} -> ${newId}] => Migration Failed. User ${newId} must be a therapist`
    )
    return res.status(StatusCodes.FORBIDDEN).json({
      message: `Migration Failed. User ${newId} must be a therapist`,
    })
  } catch (error) {
    logger.error(`MIGRATE => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function archive(req: Request<ProcessIDPrams, {}, {}>, res: Response) {
  try {
    var decoded = res.locals.token
    let callerIsAdmin = decoded.admin
    var processId = parseInt(req.params.processId)

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

    // verify if the caller has permissions to archive the process.
    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (!callerIsAdmin && !(permissions != null && permissions.archive)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    await prisma.process.update({
      data: { active: !process?.active },
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
  /**
   * Returns the info of the process associated with the given id.
   */
  try {
    var decoded = res.locals.token

    let callerIsAdmin = decoded.admin
    let callerId = decoded.id

    var processId = parseInt(req.params.processId)

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: callerId,
      },
    })

    if (!callerIsAdmin && !(permissions != null && permissions.see)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    // main therapist, id and name
    let mainTherapistPermissions = await prisma.permissions.findFirst({
      where: { process_id: processId, isMain: true },
    })
    let mainTherapistPerson = await prisma.person.findFirst({
      where: { id: mainTherapistPermissions?.person_id },
    })

    // collaborators
    let collaborators = await privateGetCollaborators(processId)

    // care takers
    let careTakers = await privateGetCareTakers(processId)

    // patients, name and id
    let patients = await privateGetPatients(processId)

    // financial state (if every past appointments have been paid)
    let paid = await privateGetFinancialState(processId)

    // build info to return
    let infoToReturn = {
      mainTherapist: { id: mainTherapistPerson?.id, name: mainTherapistPerson?.name },
      collaborators: collaborators,
      careTakers: careTakers,
      patients: patients,
      paid: paid,
      ref: process.ref,
      remarks: process.remarks,
      speciality: process.speciality_speciality,
      active: process.active,
      processId: processId,
    }

    return res.status(StatusCodes.OK).json({
      data: infoToReturn,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request<{}, {}, {}, QueryListProcess>, res: Response) {
  /**
   * Returns a list of processes that the caller can see.
   * Admin can see all
   * Therapist, the ones that he is associated with
   * Intern, the ones that he is associated with and has see permission
   */
  try {
    var decoded = res.locals.token

    let callerIsAdmin = decoded.admin
    let callerRole = decoded.role
    let callerId = decoded.id

    if (callerRole == "accountant" || callerRole == "guard") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to acces this information.",
      })
    }

    // active null e speciality null, enviar todos
    // active null e speciality != null
    // active != null e speciality != null
    // active != null e speciality == null
    let active = req.query.active // to know if active was given
    let active_value = req.query.active === "true" // the actual value of active
    let speciality = req.query.speciality

    let processes

    if (active != null && speciality != null) {
      processes = await prisma.process.findMany({
        where: { active: active_value, speciality_speciality: speciality },
      })
    } else if (active != null && speciality == null) {
      processes = await prisma.process.findMany({ where: { active: active_value } })
    } else if (active == null && speciality != null) {
      processes = await prisma.process.findMany({ where: { speciality_speciality: speciality } })
    } else {
      processes = await prisma.process.findMany()
    }

    let infoToReturn = []

    for (let process of processes) {
      let processId = Number(process.id)

      // check if the caller can see this process
      var permissions = await prisma.permissions.findFirst({
        where: {
          process_id: processId,
          person_id: callerId,
        },
      })

      if (!callerIsAdmin && !(permissions != null && permissions.see)) {
        // if the caller cannot see this process, skip
        continue
      }

      // main therapist, id and name
      let mainTherapistPermissions = await prisma.permissions.findFirst({
        where: { process_id: processId, isMain: true },
      })
      let mainTherapistPerson = await prisma.person.findFirst({
        where: { id: mainTherapistPermissions?.person_id },
      })

      // collaborators
      let collaborators = await privateGetCollaborators(processId)

      // care takers
      let careTakers = await privateGetCareTakers(processId)

      // patients, name and id
      let patients = await privateGetPatients(processId)

      // financial state (if every past appointments have been paid)
      let paid = await privateGetFinancialState(processId)

      // next appointment
      let nextAppointment = await privateGetNextAppointment(processId)

      // build info to return
      let processInfo = {
        mainTherapist: { id: mainTherapistPerson?.id, name: mainTherapistPerson?.name },
        collaborators: collaborators,
        careTakers: careTakers,
        patients: patients,
        paid: paid,
        ref: process.ref,
        remarks: process.remarks,
        speciality: process.speciality_speciality,
        active: process.active,
        nextAppointment: nextAppointment,
        processId: processId,
      }

      infoToReturn.push(processInfo)
    }

    return res.status(StatusCodes.OK).json({
      data: infoToReturn,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// se calhar já não é preciso
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

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

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

    let callerIsAdmin = decoded.admin
    let callerRole = decoded.role
    let callerId = decoded.id

    // verify if the caller is an admin
    // only admins ca create processes
    if (!callerIsAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to perform this action.",
      })
    }

    // get info of the patients, to use the name of one of them to create the process ref.
    let patient = await prisma.person.findFirst({ where: { id: req.body.patientIds[0] } })

    // get the info of the speciality
    let speciality = await prisma.speciality.findFirst({
      where: { speciality: req.body.speciality },
    })

    // get the current date, so that the ref is unique.
    let now = Date.now()

    let ref = `${speciality?.code}_${patient?.name}_${now}`

    // create the process
    var process = await prisma.process.create({
      data: {
        active: true,
        ref: ref,
        remarks: req.body.remarks,
        speciality_speciality: req.body.speciality,
      },
    })

    // assign the main therapist
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

    // add patients to the process
    for (let patientId of req.body.patientIds) {
      await prisma.patient_process.create({
        data: {
          patient_person_id: patientId,
          process_id: process.id,
        },
      })
    }

    // add liables
    for (let liableId of req.body.liableIds) {
      await prisma.process_liable.create({
        data: {
          liable_id: liableId,
          process_id: process.id,
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
    let callerIsAdmin = decoded.admin
    var processId = parseInt(req.params.processId)

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

    // obtain the permissions of the caller (therapists and interns)
    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (!callerIsAdmin && !(permissions != null && permissions.editprocess)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization",
      })
    }

    // get the code of the given speciality
    let speciality = await prisma.speciality.findFirst({
      where: { speciality: req.body.speciality },
    })

    // get the name of the patients
    let patient_process = await prisma.patient_process.findMany({
      where: { process_id: processId },
    })
    // get only the name of one of them
    let patient = await prisma.person.findFirst({
      where: { id: patient_process[0].patient_person_id },
    })

    // get the current date, so that the ref is unique.
    let now = Date.now()

    // update speciality and remarks
    await prisma.process.update({
      where: {
        id: processId,
      },
      data: {
        speciality_speciality: req.body.speciality,
        remarks: req.body.remarks,
        // ref: `${speciality?.code}_${patient?.name}_${now}`,
      },
    })

    // update the collaborators of the process
    updateCollaborators(req.body.colaborators, processId)

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
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    var processId = parseInt(req.params.processId)

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

    var allAppointmentsInfo: any = []
    // get the appointments of the process
    var appointment_process = await prisma.appointment_process.findMany({
      where: { process_id: process.id },
    })
    // get the interns of the process
    var intern_process = await prisma.intern_process.findMany({
      where: { process_id: process.id },
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

    // get the therapists of the process
    var therapist_process = await prisma.therapist_process.findMany({
      where: { process_id: process.id },
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

    // get the patients of the process
    var patient_process = await prisma.patient_process.findMany({
      where: { process_id: process.id },
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
        where: { process_id: process.id },
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
        processId: process.id,
        speciality: process.speciality_speciality,
      })
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

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

    await prisma.notes.create({
      data: {
        datetime: date,
        title: req.body.title,
        body: req.body.body,
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

    var decoded = res.locals.token
    var noteId = parseInt(req.params.noteId)

    let id = decoded.id
    let role = decoded.role

    let permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: id,
      },
    })

    if (role != "admin" && permissions == null && !permissions!.see) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Not enough permissions",
      })
    }

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
      list.push({ title: note.title, body: note.body, date: formattedDate, id: note.id })
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

    // check if the process exists.
    let process = await prisma.process.findFirst({ where: { id: processId } })

    if (process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given id is not associated with a process.",
      })
    }

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

    // get the process collaborators
    let infoToReturn = await privateGetCollaborators(processId)

    res.status(StatusCodes.OK).json({
      data: infoToReturn,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getProcesses(req: Request, res: Response) {
  /**
   * Returns all the processes that an intern or therapist that are calling are associated, however, if the caller is an admin, all the processess are returned.
   */

  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    if (callerRole == "accountant" && callerRole == "guard") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to access this information.",
      })
    }

    let processes = []
    if (callerIsAdmin) {
      // return all processes
      // get the id and ref of the processes
      processes = await prisma.process.findMany({
        select: {
          id: true,
          ref: true,
        },
      })
    } else if (callerRole == "therapist") {
      // get only the processes in which the therapist is associated.
      let therapist_process = await prisma.therapist_process.findMany({
        where: { therapist_person_id: callerId },
      })

      for (let i = 0; i < therapist_process.length; i++) {
        processes.push(
          await prisma.process.findFirst({
            where: { id: therapist_process[i].process_id },
            select: { id: true, ref: true },
          })
        )
      }
    } else if (callerRole == "intern") {
      // get only the processes in which the intern is associated.
      let intern_process = await prisma.intern_process.findMany({
        where: { intern_person_id: callerId },
      })

      for (let i = 0; i < intern_process.length; i++) {
        processes.push(
          await prisma.process.findFirst({
            where: { id: intern_process[i].process_id },
            select: { id: true, ref: true },
          })
        )
      }
    }

    // assemble the data to be returned
    let infoToReturn = []

    for (let i = 0; i < processes.length; i++) {
      // for each process, get all the ids and names of the therapists associated
      let therapists = await getProcessTherapists(processes[i]?.id)
      infoToReturn.push({
        processId: processes[i]?.id,
        name: processes[i]?.ref,
        therapists: therapists,
      })
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

async function getProcessTherapists(processId: bigint | undefined) {
  /**
   * Returns the ids and names of all the therapists associated with a process.
   */
  if (processId == undefined) {
    return []
  }

  let therapist_process = await prisma.therapist_process.findMany({
    where: { process_id: processId },
  })
  let therapists = []
  for (let i = 0; i < therapist_process.length; i++) {
    let person = await prisma.person.findFirst({
      where: { id: therapist_process[i].therapist_person_id },
    })
    therapists.push({
      id: person?.id,
      name: person?.name,
    })
  }
  return therapists
}

async function updateCollaborators(collaboratorIds: number[], processId: number) {
  /**
   * Add new collaborators
   * Delete old collaborators
   * Maintains the current collaboratos.
   */

  // iterate over the given ids
  for (let newCollaborator of collaboratorIds) {
    // if already collaborator, do nothing
    let permission = await prisma.permissions.findFirst({
      where: { person_id: newCollaborator, process_id: processId },
    })

    // if new, create link and permissions
    if (permission == null) {
      // check if the id is of a therapist or an intern
      let therapist = await prisma.therapist.findFirst({ where: { person_id: newCollaborator } })
      if (therapist != null) {
        // is therapist
        // create link to process
        await prisma.therapist_process.create({
          data: { therapist_person_id: newCollaborator, process_id: processId },
        })
        // create permissions
        await prisma.permissions.create({
          data: {
            editpatitent: true,
            see: true,
            appoint: true,
            statitics: true,
            editprocess: true,
            isMain: false, // not the main therapist
            process_id: processId,
            person_id: newCollaborator,
          },
        })
      } else {
        // is intern
        // create link to process
        await prisma.intern_process.create({
          data: { intern_person_id: newCollaborator, process_id: processId },
        })
        // create permissions
        await prisma.permissions.create({
          data: {
            editpatitent: false,
            see: false,
            appoint: false,
            statitics: false,
            editprocess: false,
            isMain: false, // not the main therapist
            process_id: processId,
            person_id: newCollaborator,
          },
        })
      }
    }
  }

  // if there are collaborators in the process not in the given ids, delete them
  // remove old collaborators
  let collaborators = await prisma.permissions.findMany({
    where: { process_id: processId, isMain: false },
  })
  for (let collaborator of collaborators) {
    // if this collaborator is not in the given array, delete him.
    if (!collaboratorIds.includes(Number(collaborator.person_id))) {
      // check if the collaborator is a therapist or an intern.
      let therapist = await prisma.therapist.findFirst({
        where: { person_id: collaborator.person_id },
      })
      // delete permissions
      await prisma.permissions.delete({ where: { id: collaborator.id } })
      if (therapist != null) {
        // delete the link to the process
        // it has to be deleteMany so that I can pass those parameters to the query
        await prisma.therapist_process.deleteMany({
          where: { therapist_person_id: collaborator.person_id, process_id: processId },
        })
      } else {
        // delete the link to the process
        await prisma.intern_process.deleteMany({
          where: { intern_person_id: collaborator.person_id, process_id: processId },
        })
      }
    }
  }
}

async function note(req: Request, res: Response) {
  var decoded = res.locals.token
  var noteId = parseInt(req.params.noteId)

  let id = decoded.id
  let role = decoded.role

  let noteInfo = await prisma.notes.findUnique({
    where: {
      id: noteId,
    },
  })

  let permissions = await prisma.permissions.findFirst({
    where: {
      process_id: noteInfo?.process_id,
      person_id: id,
    },
  })

  console.log(role)

  if (permissions?.see || role == "admin") {
    let date = noteInfo?.datetime
    const formattedStartDate = date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    return res.status(StatusCodes.OK).json({
      title: noteInfo?.title,
      body: noteInfo?.body,
      date: formattedStartDate,
    })
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Don't have permissions",
    })
  }
}

async function updateNote(req: Request<ProcessIDPrams, {}, UpdateNoteBody>, res: Response) {
  try {
    var date = new Date()

    var decoded = res.locals.token
    var processId = parseInt(req.params.processId)

    let id = decoded.id
    let role = decoded.role

    let permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: id,
      },
    })

    if (role == "admin" || (permissions != null && permissions.editprocess)) {
      await prisma.notes.update({
        where: {
          id: parseInt(req.params.noteId!),
        },
        data: {
          datetime: date,
          title: req.body.title,
          body: req.body.body,
        },
      })

      return res.status(StatusCodes.OK).json({
        message: "Note Updated",
      })
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Don't have permissions",
      })
    }
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

async function privateGetCollaborators(processId: number) {
  /**
   * Return the collaborators names and ids
   */

  // get the process collaborators
  let collaborators_permissions = await prisma.permissions.findMany({
    where: { process_id: processId, isMain: false },
  })
  let therapistsInfo = []
  let internsInfo = []
  for (let collaborator_permissions of collaborators_permissions) {
    let intern = await prisma.intern.findFirst({
      where: { person_id: collaborator_permissions.person_id },
    })
    let therapist = await prisma.therapist.findFirst({
      where: { person_id: collaborator_permissions.person_id },
    })
    let person = await prisma.person.findFirst({
      where: { id: collaborator_permissions.person_id },
    })

    let collaboratorInfoBase = {
      name: person?.name,
      id: person?.id,
      email: person?.email,
      address: person?.address,
      birthDate: person?.birth_date,
      photo: person?.photo,
      phoneNumber: person?.phone_number,
      verified: person?.verified,
      active: person?.active,
      approved: person?.approved,
      taxNumber: person?.tax_number,
    }

    if (intern != null) {
      // is intern
      internsInfo.push(collaboratorInfoBase)
    } else if (therapist != null) {
      // is therapist
      let collaboratorInfoTherapist = {
        ...collaboratorInfoBase,
        extern: therapist.extern,
        license: therapist.license,
        health_system: therapist.health_system,
      }
      therapistsInfo.push(collaboratorInfoTherapist)
    }
  }

  let infoToReturn = {
    therapists: therapistsInfo,
    interns: internsInfo,
  }
  return infoToReturn
}

async function privateGetCareTakers(processId: number) {
  /**
   * Return the care takers info
   */

  //obtain information about the care takers
  let careTakers = await prisma.process_liable.findMany({ where: { process_id: processId } })

  // for each care taker
  let careTakersInfo = []
  for (let i = 0; i < careTakers.length; i++) {
    let careTaker = await prisma.liable.findFirst({ where: { id: careTakers[i].liable_id } })
    careTakersInfo.push({
      name: careTaker?.name,
      email: careTaker?.email,
      phoneNumber: careTaker?.phonenumber,
      type: careTaker?.type,
      remarks: careTaker?.remarks,
      careTakerId: careTaker?.id,
    })
  }

  return careTakersInfo
}

async function privateGetPatients(processId: number) {
  /**
   * Return the patient names and ids
   */

  // obtain the patients ids
  let patients = await prisma.patient_process.findMany({ where: { process_id: processId } })

  // for each patient
  let patientsInfo = []
  for (let i = 0; i < patients.length; i++) {
    let patient = await prisma.person.findFirst({ where: { id: patients[i].patient_person_id } })
    patientsInfo.push({ id: patient?.id, name: patient?.name })
  }

  return patientsInfo
}

async function privateGetFinancialState(processId: number) {
  /**
   * Returns true if all the appointments that were archived have been paid, else, false
   */

  // get all the appointments of the process
  let appointments = await prisma.appointment_process.findMany({ where: { process_id: processId } })

  // check if all that were archived, aka, have a receipt have been paid
  let paid = true
  for (let appointment of appointments) {
    let receipt = await prisma.receipt.findFirst({
      where: { appointment_slot_id: appointment.appointment_slot_id },
    })
    if (!receipt?.payed) {
      paid = false
    }
  }
  return paid
}

async function privateGetNextAppointment(processId: number) {
  /**
   * Returns the nex appointment in the process.
   * If it does not exist, returns null
   */

  // get the appointments of the process
  let appointment_process = await prisma.appointment_process.findMany({
    where: { process_id: processId },
  })

  // check if there is any future appointment
  let now = Date.now()
  let appointmentToReturn = null
  for (let i = 0; i < appointment_process.length; i++) {
    let appointment = await prisma.appointment.findFirst({
      where: { slot_id: appointment_process[i].appointment_slot_id },
    })
    // check if the appointment is active
    if (appointment?.active) {
      // check date (is the appointment in the future?)
      let appointmentStartDate = new Date(appointment.slot_start_date)
      let appointmentStartTime = appointmentStartDate.getTime()
      if (appointmentStartTime > now) {
        // in the future
        if (appointmentToReturn == null) {
          appointmentToReturn = appointment
        } else {
          // check if the new is earlier than the already found
          let appointmentToReturnStartDate = new Date(appointment.slot_start_date)
          let appointmentToReturnTime = appointmentToReturnStartDate.getTime()
          if (appointmentStartTime < appointmentToReturnTime) {
            // the new is in the future and is earlier than the one previously found.
            appointmentToReturn = appointment
          }
        }
      }
    }
  }
  return appointmentToReturn
}

export async function receiptList(req: Request<{ processId: string }>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  const processId = Number(req.params.processId)

  // Fetch Process
  const process = await prisma.process.findUnique({
    where: { id: processId },
  })

  // Check If It Exists
  if (process === null || process === undefined) {
    logger.info(`RECEIPT [user-id: ${id}] => The process does not exist.`)
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `Process with id '${processId} does not exist...`,
    })
  }

  try {
    // Check Permissions (Admin access is always granted)
    if (!admin && role !== User.ACCOUNTANT) {
      let access = false
      if (role == User.THERAPIST) {
        // Grant access if therapist belongs to the process
        const process = await prisma.therapist_process.findUnique({
          where: {
            therapist_person_id_process_id: {
              therapist_person_id: id,
              process_id: processId,
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
              process_id: processId,
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
          `RECEIPT [user-id: ${id}] => Authorization to fetch receipts revoked (insufficient permissions)`
        )
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Receipt Listing Failed (insufficient permissions)",
        })
      }
    }
    logger.info(`RECEIPT [user-id: ${id}] => Authorization to fetch receipts granted...`)
    const appointments = await prisma.appointment_process.findMany({
      where: { process_id: processId },
    })

    // Return receipts
    let receipts = []
    for (let appointment of appointments) {
      receipts.push(await buildReceipt(Number(appointment.appointment_slot_id)))
    }

    logger.debug(`RECEIPT [user-id: ${id}] => Receipts Retrieved Successfully...`)
    res.status(StatusCodes.OK).json({
      message: "Receipts Retrieved Successfully",
      data: receipts.filter((r) => r !== null),
    })
  } catch (error) {
    logger.error(`RECEIPT => Server Error: ${error}`)
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
  getProcesses,
  migrate,
  note,
  updateNote,
  receiptList,
}
