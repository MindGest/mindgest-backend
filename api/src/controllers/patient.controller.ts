import prisma from "../utils/prisma"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import {
  GetPatientTypeBody,
  GetPatientInfoBody,
  CreateChildPatientBody,
  CreateTeenPatientBody,
  CreateAdultPatientBody,
  EditChildPatientBody,
  EditTeenPatientBody,
  EditAdultPatientBody,
  ArchivePatientBody,
  EditCoupleOrFamilyPatientBody,
  EditCareTaker,
} from "../utils/types"
import logger from "../utils/logger"
import uploadPicture from "../utils/upload"
import { getProfilePicture, saveProfilePicture } from "../services/profile.service"

const CHILD_PATIENT = "child"
const TEEN_PATIENT = "teen"
const ADULT_PATIENT = "adult"
const ELDER_PATIENT = "elder"
const FAMILY_PATIENT = "family"
const COUPLE_PATIENT = "couple"
const DUMMY_PASSWORD = "ImDummyDaBaDeeDaBaDi"

// listar todos os pacientes (nome e tipo talvez idk, preciso para a criação do processo)
export async function listPatients(req: Request, res: Response) {
  /**
   * if admin, return all
   * if therapist or intern, return the associated patients
   * as said in the mockups, it does not matter the permissions of the intern
   */
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // check authorization for this endpoint
    if (callerRole == "accountant" || callerRole == "guard") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information.",
      })
    }

    // get the processes (the part that is different for the various allowed users in this endpoint)
    let processes = []
    if (callerRole == "admin") {
      processes = await prisma.process.findMany()
    } else if (callerRole == "therapist") {
      let therapist_process = await prisma.therapist_process.findMany({
        where: { therapist_person_id: callerId },
      })
      for (let i = 0; i < therapist_process.length; i++) {
        processes.push(
          await prisma.process.findFirst({ where: { id: therapist_process[i].process_id } })
        )
      }
    } else if (callerRole == "intern") {
      let intern_process = await prisma.intern_process.findMany({
        where: { intern_person_id: callerId },
      })
      for (let i = 0; i < intern_process.length; i++) {
        processes.push(
          await prisma.process.findFirst({ where: { id: intern_process[i].process_id } })
        )
      }
    }

    // obtain the set of unique patient ids from the processes
    let patientIdsSet = new Set<number>()
    for (let process of processes) {
      if (process == null) {
        continue
      }
      // get the patients
      let patient_process = await prisma.patient_process.findMany({
        where: { process_id: process.id },
      })
      for (let patientId of patient_process) {
        patientIdsSet.add(Number(patientId.patient_person_id))
      }
    }

    // for each patient
    let infoToReturn = []
    for (let patientId of patientIdsSet) {
      // get the type of patient, because the info  of each type may differ.
      let patientTypeName = await privateGetPatientType(patientId)
      let data = null

      if (patientTypeName == CHILD_PATIENT || patientTypeName == TEEN_PATIENT) {
        data = await buildInfoChildOrTeenPatient(patientId, patientTypeName)
      } else if (patientTypeName == ELDER_PATIENT || patientTypeName == ADULT_PATIENT) {
        data = await buildInfoAdultOrElderPatient(patientId, patientTypeName)
      }
      infoToReturn.push(data)
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

// retornar info de um paciente dado o seu id.
export async function getPatientInfo(req: Request<{}, {}, GetPatientInfoBody>, res: Response) {
  /**
   * return the information of the patient associated with the given id.
   */
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    let isAnAuthorizedIntern = false
    let patientId = req.body.patientId

    // if intern, verify if he is in a process with this patient
    if (callerRole == "intern") {
      // get the processes with this patient
      let intern_process = await prisma.intern_process.findMany({
        where: { intern_person_id: callerId },
      })

      // verify if the intern is associated with any of them
      for (let i = 0; i < intern_process.length; i++) {
        let patient_process = await prisma.patient_process.findFirst({
          where: { process_id: intern_process[i].process_id, patient_person_id: patientId },
        })
        // if associated, check intern permissions (see permission)
        if (patient_process != null) {
          let permission = await prisma.permissions.findFirst({
            where: { process_id: patient_process.process_id, person_id: callerId },
          })
          if (permission != null && permission.see) {
            // if he has see permission, allow him to get this info
            isAnAuthorizedIntern = true
          }
        }
      }
    }

    // if admin, therapist, or an authorized intern, let them retrieve this information
    if (!callerIsAdmin && !isAnAuthorizedIntern && callerRole != "therapist") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information.",
      })
    }

    // get the type of patient, because the info  of each type may differ.
    let patientTypeName = await privateGetPatientType(patientId)
    let data = null

    if (patientTypeName == CHILD_PATIENT || patientTypeName == TEEN_PATIENT) {
      data = await buildInfoChildOrTeenPatient(patientId, patientTypeName)
    } else if (patientTypeName == ELDER_PATIENT || patientTypeName == ADULT_PATIENT) {
      data = await buildInfoAdultOrElderPatient(patientId, patientTypeName)
    }

    res.status(StatusCodes.OK).json({
      data: data,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// criar pacientes (crianca)
export async function createChildPatient(
  req: Request<{}, {}, CreateChildPatientBody>,
  res: Response
) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    if (!callerIsAdmin && !(callerRole == "therapist") && !(callerRole == "intern")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to sail in these waters.",
      })
    }

    // create the person
    let person = await prisma.person.create({
      data: {
        password: DUMMY_PASSWORD, // TODO: os patients não têm password, o que colocar?
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        verified: true, // não sei se há forma de aprovar TODO: mudar depois
        active: true,
        approved: true, // não sei se há forma de aprovar TODO: mudar depois
        tax_number: req.body.taxNumber,
      },
    })
    // create the patient
    let patient = await prisma.patient.create({
      data: {
        person_id: person.id,
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      },
    })

    // create the school
    await prisma.school.create({
      data: {
        grade: req.body.grade,
        name: req.body.school,
        course: "",
        patient_person_id: patient.person_id,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "patient created successfully.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// criar paciente (jovem)
export async function createTeenPatient(
  req: Request<{}, {}, CreateTeenPatientBody>,
  res: Response
) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    if (!callerIsAdmin && !(callerRole == "therapist") && !(callerRole == "intern")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Your ship is not built for these seas.",
      })
    }

    // create the person
    let person = await prisma.person.create({
      data: {
        password: DUMMY_PASSWORD, // TODO: os patients não têm password, o que colocar?
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        verified: true, // não sei se há forma de aprovar TODO: mudar depois
        active: true,
        approved: true, // não sei se há forma de aprovar TODO: mudar depois
        tax_number: req.body.taxNumber,
      },
    })
    // create the patient
    let patient = await prisma.patient.create({
      data: {
        person_id: person.id,
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      },
    })

    // create the school
    await prisma.school.create({
      data: {
        grade: req.body.grade,
        name: req.body.school,
        course: req.body.course,
        patient_person_id: patient.person_id,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "Teen patient created successfully.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// criar paciente (adulto, idoso, casal, familia)
export async function createAdultOrElderPatient(
  req: Request<{}, {}, CreateAdultPatientBody>,
  res: Response
) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    if (!callerIsAdmin && !(callerRole == "therapist") && !(callerRole == "intern")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You shall not PASSS!",
      })
    }

    // create the person
    let person = await prisma.person.create({
      data: {
        password: DUMMY_PASSWORD, // TODO: os patients não têm password, o que colocar?
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        verified: true, // não sei se há forma de aprovar TODO: mudar depois
        active: true,
        approved: true, // não sei se há forma de aprovar TODO: mudar depois
        tax_number: req.body.taxNumber,
      },
    })
    // create the patient
    let patient = await prisma.patient.create({
      data: {
        person_id: person.id,
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      },
    })

    // create the profession
    await prisma.profession.create({
      data: {
        name: req.body.profession,
        patient_person_id: patient.person_id,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "Teen patient created successfully.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// update child patient
export async function editChildPatient(req: Request<{}, {}, EditChildPatientBody>, res: Response) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // check authorizations
    // allow admins, therapist and intern (that have edit permissions) associated in the given process.

    let canEdit = false
    let processId = req.body.processId

    // check permission therapist
    if (callerRole == "therapist") {
      let therapist_process = await prisma.therapist_process.findFirst({
        where: { therapist_person_id: callerId, process_id: processId },
      })
      if (therapist_process != null) {
        canEdit = true
      }
    }
    // check permission intern
    else if (callerRole == "intern") {
      let permission = await prisma.permissions.findFirst({
        where: { person_id: callerId, process_id: processId },
      })
      if (permission != null && permission.editpatitent) {
        canEdit = true
      }
    }

    if (!callerIsAdmin && !canEdit) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You don't have what it takes to wield this power!",
      })
    }

    // update person
    await prisma.person.update({
      where: { id: req.body.patientId },
      data: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        tax_number: req.body.taxNumber,
      },
    })

    // update the patient
    await prisma.patient.update({
      where: { person_id: req.body.patientId },
      data: {
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      },
    })

    // update school
    let school = await prisma.school.findFirst({
      where: { patient_person_id: req.body.patientId },
    })

    await prisma.school.update({
      where: { id: school?.id },
      data: {
        grade: req.body.grade,
        name: req.body.school,
      },
    })

    // update care takers
    // updateCareTakers(req.body.careTakers)

    res.status(StatusCodes.OK).json({
      message: "Patient updated with success.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// update teen patient
export async function editTeenPatient(req: Request<{}, {}, EditTeenPatientBody>, res: Response) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // check authorizations
    // allow admins, therapist and intern (that have edit permissions) associated in the given process.

    let canEdit = false
    let processId = req.body.processId

    // check permission therapist
    if (callerRole == "therapist") {
      let therapist_process = await prisma.therapist_process.findFirst({
        where: { therapist_person_id: callerId, process_id: processId },
      })
      if (therapist_process != null) {
        canEdit = true
      }
    }
    // check permission intern
    else if (callerRole == "intern") {
      let permission = await prisma.permissions.findFirst({
        where: { person_id: callerId, process_id: processId },
      })
      if (permission != null && permission.editpatitent) {
        canEdit = true
      }
    }

    if (!callerIsAdmin && !canEdit) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You don't have what it takes to wield this power!",
      })
    }

    // update person
    await prisma.person.update({
      where: { id: req.body.patientId },
      data: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        tax_number: req.body.taxNumber,
      },
    })

    // update the patient
    await prisma.patient.update({
      where: { person_id: req.body.patientId },
      data: {
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      },
    })

    // update school
    let school = await prisma.school.findFirst({
      where: { patient_person_id: req.body.patientId },
    })

    await prisma.school.update({
      where: { id: school?.id },
      data: {
        grade: req.body.grade,
        name: req.body.school,
        course: req.body.course,
      },
    })

    // update care takers
    // updateCareTakers(req.body.careTakers)

    res.status(StatusCodes.OK).json({
      message: "Patient updated with success.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// update Adutl and elder
export async function editAdultOrElderPatient(
  req: Request<{}, {}, EditAdultPatientBody>,
  res: Response
) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // check authorizations
    // allow admins, therapist and intern (that have edit permissions) associated in the given process.

    let canEdit = false
    let processId = req.body.processId

    // check permission therapist
    if (callerRole == "therapist") {
      let therapist_process = await prisma.therapist_process.findFirst({
        where: { therapist_person_id: callerId, process_id: processId },
      })
      if (therapist_process != null) {
        canEdit = true
      }
    }
    // check permission intern
    else if (callerRole == "intern") {
      let permission = await prisma.permissions.findFirst({
        where: { person_id: callerId, process_id: processId },
      })
      if (permission != null && permission.editpatitent) {
        canEdit = true
      }
    }

    if (!callerIsAdmin && !canEdit) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You don't have what it takes to wield this power!",
      })
    }

    // update person
    await prisma.person.update({
      where: { id: req.body.patientId },
      data: {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        tax_number: req.body.taxNumber,
      },
    })

    // update the patient
    await prisma.patient.update({
      where: { person_id: req.body.patientId },
      data: {
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      },
    })

    // update profession
    let profession = await prisma.profession.findFirst({
      where: { patient_person_id: req.body.patientId },
    })

    await prisma.profession.update({
      where: { id: profession?.id },
      data: {
        name: req.body.profession,
      },
    })

    // update care takers
    // updateCareTakers(req.body.careTakers)

    res.status(StatusCodes.OK).json({
      message: "Patient updated with success.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// update couple and family
// export async function editCoupleOrFamilyPatient(
//   req: Request<{}, {}, EditCoupleOrFamilyPatientBody>,
//   res: Response
// ) {
//   try {
//     var decodedToken = res.locals.token

//     // obtain the caller properties
//     var callerId = decodedToken.id
//     var callerRole = decodedToken.role
//     var callerIsAdmin = decodedToken.admin

//     // check authorizations
//     // allow admins, therapist and intern (that have edit permissions) associated in the given process.

//     let canEdit = false
//     let processId = req.body.processId

//     // check permission therapist
//     if (callerRole == "therapist") {
//       let therapist_process = await prisma.therapist_process.findFirst({
//         where: { therapist_person_id: callerId, process_id: processId },
//       })
//       if (therapist_process != null) {
//         canEdit = true
//       }
//     }
//     // check permission intern
//     else if (callerRole == "intern") {
//       let permission = await prisma.permissions.findFirst({
//         where: { person_id: callerId, process_id: processId },
//       })
//       if (permission != null && permission.editpatitent) {
//         canEdit = true
//       }
//     }

//     if (!callerIsAdmin && !canEdit) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         message: "You don't have what it takes to wield this power!",
//       })
//     }

//     // update person
//     await prisma.person.update({
//       where: { id: req.body.patientId },
//       data: {
//         name: req.body.name,
//         email: req.body.email,
//         address: req.body.address,
//         birth_date: req.body.birthDate,
//         photo: req.body.photo,
//         phone_number: req.body.phoneNumber,
//         tax_number: req.body.taxNumber,
//       },
//     })

//     // update the patient
//     await prisma.patient.update({
//       where: { person_id: req.body.patientId },
//       data: {
//         health_number: req.body.healthNumber,
//         request: req.body.request,
//         remarks: req.body.remarks,
//         patienttype_id: req.body.patientTypeId,
//       },
//     })

//     // update profession
//     let profession = await prisma.profession.findFirst({
//       where: { patient_person_id: req.body.patientId },
//     })

//     await prisma.profession.update({
//       where: { id: profession?.id },
//       data: {
//         name: req.body.profession,
//       },
//     })

//     res.status(StatusCodes.OK).json({
//       message: "Patient updated with success.",
//     })
//   } catch (error) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "Ups... Something went wrong",
//     })
//   }
// }

// archive patient
// lets archive and activate a patient
export async function archivePatient(req: Request<{}, {}, ArchivePatientBody>, res: Response) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // check authorizations
    // only admins can archive a patient (why, because I say so.)

    if (!callerIsAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "U Can't Touch This",
      })
    }

    // flip the state of the patient
    let person = await prisma.person.findFirst({ where: { id: req.body.patientId } })

    await prisma.person.update({
      where: { id: req.body.patientId },
      data: {
        active: !person?.active,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "The status of the patient has changed.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// retornar o tipo de um paciente (pode dar jeito)
export async function getPatientType(req: Request<{}, {}, GetPatientTypeBody>, res: Response) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    let isAnAuthorizedIntern = false
    let patientId = req.body.patientId

    // if intern, verify if he is in a process with this patient
    if (callerRole == "intern") {
      // get the processes with this patient
      let intern_process = await prisma.intern_process.findMany({
        where: { intern_person_id: callerId },
      })

      // verify if the intern is associated with any of them
      for (let i = 0; i < intern_process.length; i++) {
        let patient_process = await prisma.patient_process.findFirst({
          where: { process_id: intern_process[i].process_id, patient_person_id: patientId },
        })
        // if associated, check intern permissions (see permission)
        if (patient_process != null) {
          let permission = await prisma.permissions.findFirst({
            where: { process_id: patient_process.process_id, person_id: callerId },
          })
          if (permission != null && permission.see) {
            // if he has see permission, allow him to get this info
            isAnAuthorizedIntern = true
          }
        }
      }
    }

    // if admin, therapist, or an authorized intern, let them retrieve this information
    if (!callerIsAdmin && !isAnAuthorizedIntern && callerRole != "therapist") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information.",
      })
    }

    let patientTypeName = await privateGetPatientType(patientId)

    res.status(StatusCodes.OK).json({
      data: {
        patientTypeName: patientTypeName,
      },
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// retornar todos os tipos de pacientes
export async function getPatientTypes(req: Request, res: Response) {
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    let isAnAuthorizedIntern = false
    let patientId = req.body.patientId

    // if admin, therapist, or an authorized intern, let them retrieve this information
    if (!callerIsAdmin && !(callerRole == "therapist") && !(callerRole == "intern")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information.",
      })
    }

    // get all the types
    let patientTypes = await prisma.patienttype.findMany({})

    res.status(StatusCodes.OK).json({
      data: {
        patientTypes: patientTypes,
      },
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

async function privateGetPatientType(patientId: number) {
  // get some of the patient info
  let patient = await prisma.patient.findFirst({ where: { person_id: patientId } })

  // get the patientType name
  let patientType = await prisma.patienttype.findFirst({ where: { id: patient?.patienttype_id } })

  return patientType?.type
}

async function buildInfoChildOrTeenPatient(patientId: number, patientTypeName: string) {
  /**
   * build a json with the information of the teen or child patient of the given id.
   */

  let person = await prisma.person.findFirst({ where: { id: patientId } })

  let patient = await prisma.patient.findFirst({ where: { person_id: patientId } })

  let school = await prisma.school.findFirst({ where: { patient_person_id: patientId } })

  // obtain information about the care takers
  // let careTakers = await prisma.process_liable.findMany({ where: { process_id: processId } })

  // // for each care taker
  // let careTakersInfo = []
  // for (let i = 0; i < careTakers.length; i++) {
  //   let careTaker = await prisma.liable.findFirst({ where: { id: careTakers[i].liable_id } })
  //   careTakersInfo.push({
  //     name: careTaker?.name,
  //     email: careTaker?.email,
  //     phoneNumber: careTaker?.phonenumber,
  //     type: careTaker?.type,
  //     remarks: careTaker?.remarks,
  //     careTakerId: careTaker?.id,
  //   })
  // }

  let patientInfo = null
  if (patientTypeName == TEEN_PATIENT) {
    patientInfo = {
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
      healthNumber: patient?.health_number,
      request: patient?.request,
      remarks: patient?.remarks,
      patientTypeName: patientTypeName,
      grade: school?.grade,
      school: school?.name,
      course: school?.course,
      // careTakers: careTakersInfo,
    }
  } else if (patientTypeName == CHILD_PATIENT) {
    patientInfo = {
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
      healthNumber: patient?.health_number,
      request: patient?.request,
      remarks: patient?.remarks,
      patientTypeName: patientTypeName,
      grade: school?.grade,
      school: school?.name,
      // careTakers: careTakersInfo,
    }
  }

  return patientInfo
}

async function buildInfoAdultOrElderPatient(patientId: number, patientTypeName: string) {
  /**
   * build a json with the information of the adult or elder patient of the given id.
   */

  let person = await prisma.person.findFirst({ where: { id: patientId } })

  let patient = await prisma.patient.findFirst({ where: { person_id: patientId } })

  let profession = await prisma.profession.findFirst({ where: { patient_person_id: patientId } })

  // obtain information about the care takers
  // let careTakers = await prisma.process_liable.findMany({ where: { process_id: processId } })

  // for each care taker
  // let careTakersInfo = []
  // for (let i = 0; i < careTakers.length; i++) {
  //   let careTaker = await prisma.liable.findFirst({ where: { id: careTakers[i].liable_id } })
  //   careTakersInfo.push({
  //     name: careTaker?.name,
  //     email: careTaker?.email,
  //     phoneNumber: careTaker?.phonenumber,
  //     type: careTaker?.type,
  //     remarks: careTaker?.remarks,
  //     careTakerId: careTaker?.id,
  //   })
  // }

  let patientInfo = {
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
    healthNumber: patient?.health_number,
    request: patient?.request,
    remarks: patient?.remarks,
    patientTypeName: patientTypeName,
    profession: profession?.name,
    // careTakers: careTakersInfo,
  }

  return patientInfo
}

async function buildInfoCoupleOrFamilyPatient(
  patientId: number,
  processId: number,
  patientTypeName: string
) {
  /**
   * build a json with the information of the couple or family patient (all members) of the given processId.
   */

  let membersInfo = []
  // get the ids of the members (through the process)
  let members = await prisma.patient_process.findMany({ where: { process_id: processId } })
  for (let i = 0; i < members.length; i++) {
    let person = await prisma.person.findFirst({ where: { id: members[i].patient_person_id } })

    let patient = await prisma.patient.findFirst({
      where: { person_id: members[i].patient_person_id },
    })

    let profession = await prisma.profession.findFirst({
      where: { patient_person_id: members[i].patient_person_id },
    })

    let patientInfo = {
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
      healthNumber: patient?.health_number,
      request: patient?.request,
      remarks: patient?.remarks,
      patientTypeName: patientTypeName,
      profession: profession?.name,
    }

    membersInfo.push(patientInfo)
  }

  return membersInfo
}

async function updateCareTakers(careTakers: Array<EditCareTaker>) {
  /**
   * Updates the care takers of a process.
   */

  for (let i = 0; i < careTakers.length; i++) {
    await prisma.liable.update({
      where: { id: careTakers[i].id },
      data: {
        name: careTakers[i].name,
        email: careTakers[i].email,
        phonenumber: careTakers[i].phoneNumber,
        type: careTakers[i].type,
        remarks: careTakers[i].remarks,
      },
    })
  }
}

export async function uploadProfilePicture(req: Request, res: Response) {
  try {
    // Authorize user
    const { id } = res.locals.token
    logger.info(`UPLOAD [user-id: ${id}] => Profile Picture upload authorized...`)

    // Upload Profile picture
    uploadPicture(req, res, (err) => {
      if (err) {
        logger.debug(`UPLOAD [user-id: ${id}] => Upload Failed. Invalid file format!`)
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Invalid picture format (must be jpg, png, jpeg)",
        })
      }

      // Save File, Update Database
      logger.debug(`UPLOAD [user-id: ${id}] => Saving patient profile picture & updating database`)
      const picture = req.file
      if (picture === null || picture === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Picture is missing in the request",
        })
      }
      saveProfilePicture(id, picture)

      logger.info(`UPLOAD [user-id: ${id}] => Upload successful!`)
      return res.status(StatusCodes.CREATED).json({
        message: "Profile picture uploaded successfully",
      })
    })
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function downloadProfilePicture(req: Request, res: Response) {
  try {
    // Authorize user
    const { id } = res.locals.token
    logger.info(`DOWNLOAD [user-id: ${id}] => Profile picture download authorized...`)

    // Retrieve profile picture path
    const picture: string = await getProfilePicture(id)

    if (!picture.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "This user does not have a profile picture...",
      })
    }

    // Return information
    logger.info(`DOWNLOAD [user-id: ${id}] => User profile picture retrieved successfully!`)
    res.status(StatusCodes.OK).download(picture)
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  listPatients,
  getPatientInfo,
  getPatientType,
  createChildPatient,
  createTeenPatient,
  createAdultOrElderPatient,
  editChildPatient,
  editTeenPatient,
  editAdultOrElderPatient,
  //editCoupleOrFamilyPatient,
  archivePatient,
  getPatientTypes,
  uploadProfilePicture,
  downloadProfilePicture,
}
