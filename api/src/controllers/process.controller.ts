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
} from "../utils/types"
import logger from "../utils/logger"

export async function migrate(
  req: Request<ProcessIDPrams, {}, ProcessMigrationSchemaBody>,
  res: Response
) {
  try {
    const { id, role, isAdmin } = res.locals.token
    const processId = parseInt(req.params.processId)

    // Prepare Information
    let newId = req.body.therapistId
    let old = await prisma.permissions.findFirst({
      where: { isMain: false, process_id: processId },
    })
    let oldId = old?.person_id
    logger.info(`MIGRATE [${oldId} -> ${newId}] => Operation Approved! Initiating Migration...`)

    // Check if current user has permissions for executing the migration
    let permissions = await prisma.permissions.findFirst({
      where: { person_id: id, process_id: processId },
    })
    if (!isAdmin || !permissions?.editprocess) {
      logger.info(`MIGRATE [${oldId} -> ${newId}] => Migration Failed! User lacks authorization`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User doesn't have authorization to execute this operation",
      })
    }

    // Check if `newId` is a Therapist
    if (await prisma.therapist.findUnique({ where: { person_id: newId } })) {
      logger.debug(`MIGRATE [${oldId} -> ${newId}] => Migrating process...`)

      // Perform Migration
      await prisma.permissions.update({
        where: { id: old?.id },
        data: { isMain: true },
      })

      await prisma.permissions.updateMany({
        where: { person_id: newId, process_id: processId },
        data: { isMain: true },
      })

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
    let callerRole = decoded.role
    let callerId = decoded.id

    var processId = parseInt(req.params.processId)

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

    let process = await prisma.process.findFirst({ where: { id: processId } })

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
  try {
    var decoded = res.locals.token

    let callerIsAdmin = decoded.admin
    let callerRole = decoded.role
    let callerId = decoded.id

    var processId = parseInt(req.params.processId)

    var permissions = await prisma.permissions.findFirst({
      where: {
        process_id: processId,
        person_id: decoded.id,
      },
    })

    if (!callerIsAdmin && !(permissions != null && permissions.see)) {
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
          mainTherapistId = therapist.therapist_person_id
          mainTherapistName = person?.name
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

    var isPaid = true

    for (let apointment of apointments) {
      var receipt = await prisma.receipt.findFirst({
        where: {
          appointment_slot_id: apointment.appointment_slot_id,
        },
      })

      if (receipt != null) {
        if (receipt!.payed == false) {
          isPaid = false
        }
      }
    }

    return res.status(StatusCodes.OK).json({
      therapistId: mainTherapistId,
      therapistName: mainTherapistName,
      ref: processRef,
      colaborators: colaborators,
      utent: utentName?.name,
      active: process?.active,
      financialSituation: isPaid,
      remarks: process?.remarks,
      speciality: process?.speciality_speciality,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request<{}, {}, {}, QueryListProcess>, res: Response) {
  try {
    var queryParams = req.query

    var decoded = res.locals.token

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
      // todos
      processes = await prisma.process.findMany()
    }

    var listing: any = []

    for (var process of processes) {
      var therapists = await prisma.therapist_process.findMany({
        where: {
          process_id: process.id,
        },
      })

      var therapistListing: string[] = []

      var flag = false

      for (var therapist_process of therapists) {
        var therapist = await prisma.person.findUnique({
          where: {
            id: therapist_process.therapist_person_id,
          },
        })

        if (therapist?.id == decoded.id) {
          flag = true
        }

        therapistListing.push(therapist!.name)
      }

      var internListing: string[] = []

      var interns = await prisma.intern_process.findMany({
        where: {
          process_id: process.id,
        },
      })

      for (var intern_process of interns) {
        var intern = await prisma.person.findUnique({
          where: {
            id: intern_process.intern_person_id,
          },
        })

        if (intern?.id == decoded.id) {
          flag = true
        }

        internListing.push(intern!.name)
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
        let date = apointment!.slot_start_date
        nextAppointmentString = date?.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      } else {
        nextAppointmentString = "No next Appointment"
      }

      let speciality = await prisma.speciality.findFirst({
        where: {
          speciality: process.speciality_speciality,
        },
      })

      if (decoded.role === "admin" || flag === true) {
        listing.push({
          therapistListing: therapistListing,
          internListing: internListing,
          patientName: utentName?.name,
          refCode: ref,
          processId: process.id,
          active: process.active,
          nextAppointment: nextAppointmentString,
          speciality: speciality?.speciality,
        })
      }
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

// export async function edit(req: Request<ProcessIDPrams, {}, ProcessEditBody>, res: Response) {
//   try {
//     var decoded = res.locals.token
//     var processId = parseInt(req.params.processId)

//     var permissions = await prisma.permissions.findFirst({
//       where: {
//         process_id: processId,
//         person_id: decoded.id,
//       },
//     })

//     if (decoded.admin == false || permissions!.see == false) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         message: "User doesn't have authorization",
//       })
//     }

//     let permissionMainTherapist = await prisma.permissions.findFirst({
//       where: {
//         process_id: processId,
//         isMain: true,
//       },
//     })

//     await prisma.permissions.delete({
//       where: {
//         id: permissionMainTherapist?.id,
//       },
//     })

//     await prisma.therapist_process.deleteMany({
//       where: {
//         therapist_person_id: permissionMainTherapist?.person_id,
//         process_id: permissionMainTherapist?.id,
//       },
//     })

//     await prisma.therapist_process.create({
//       data: {
//         process_id: processId,
//         therapist_person_id: req.body.therapistId,
//       },
//     })

//     await prisma.permissions.create({
//       data: {
//         editpatitent: true,
//         see: true,
//         appoint: true,
//         statitics: true,
//         editprocess: true,
//         isMain: true,
//         process_id: processId,
//         person_id: req.body.therapistId,
//       },
//     })

//     await prisma.process.update({
//       where: {
//         id: processId,
//       },
//       data: {
//         speciality_speciality: req.body.speciality,
//       },
//     })

//     for (let colaboratorId of req.body.colaborators) {
//       var type = await prisma.intern.findUnique({
//         where: {
//           person_id: colaboratorId,
//         },
//       })

//       if (type != null) {
//         //é interno
//         await prisma.intern_process.create({
//           data: {
//             process_id: processId,
//             intern_person_id: colaboratorId,
//           },
//         })
//       } else {
//         //é terapeuta
//         await prisma.therapist_process.create({
//           data: {
//             process_id: processId,
//             therapist_person_id: colaboratorId,
//           },
//         })
//       }

//       await prisma.permissions.create({
//         data: {
//           process_id: processId,
//           person_id: colaboratorId,
//         },
//       })
//     }

//     return res.status(StatusCodes.OK).json({
//       message: "Edit done!",
//     })
//   } catch (error) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "Ups... Something went wrong",
//     })
//   }
// }

export async function edit(req: Request<ProcessIDPrams, {}, ProcessEditBody>, res: Response) {
  try {
    var decoded = res.locals.token

    let callerIsAdmin = decoded.admin
    let callerRole = decoded.role
    let callerId = decoded.id

    var processId = parseInt(req.params.processId)

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
        ref: `${speciality?.code}_${patient?.name}_${now}`,
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

    var decoded = res.locals.token
    var noteId = parseInt(req.params.noteId)

    let id = decoded.id
    let role = decoded.role

    let permissions = await prisma.permissions.findFirst({
      where:{
        process_id:processId,
        person_id: id
      }
    })

    if(role!="admin" && permissions == null && !permissions!.see){
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Not enough permissions"
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
    let permission = await prisma.permissions.findFirst({ where: { person_id: newCollaborator } })

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
  let collaborators = await prisma.permissions.findMany({ where: { process_id: processId } })
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
      hour: "2-digit",
      minute: "2-digit",
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
}
