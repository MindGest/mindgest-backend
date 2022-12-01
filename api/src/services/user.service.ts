import argon2 from "argon2"
import { Response, Request } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import { InternUpdateBody, TherapistUpdateBody } from "../utils/types"

// If it is a bug (or bad implementation) that you rely on.
// It's not a bug. It's a feature.
export async function fetchPersonProperties(personId: bigint) {
  let admin = await prisma.admin.findUnique({
    where: { person_id: personId },
  })
  if (admin) {
    return { isAdmin: true, userRole: "admin" }
  }

  let therapist = await prisma.therapist.findUnique({
    where: { person_id: personId },
  })
  if (therapist)
    return {
      isAdmin:
        (await prisma.admin.findUnique({
          where: { person_id: personId },
        })) !== null,
      userRole: "therapist",
    }

  let intern = await prisma.intern.findUnique({
    where: { person_id: personId },
  })
  if (intern) return { isAdmin: false, userRole: "intern" }

  let guard = await prisma.guard.findUnique({
    where: { person_id: personId },
  })
  if (guard) return { isAdmin: false, userRole: "guard" }

  let accountant = await prisma.accountant.findUnique({
    where: { person_id: personId },
  })
  if (accountant) return { isAdmin: false, userRole: "accountant" }

  return { isAdmin: true, userRole: "therapist" }
}

export async function updateInfoTherapist(id: number, body: TherapistUpdateBody) {
  await prisma.therapist.update({
    data: {
      extern: body.extern,
      license: body.license,
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

async function updateInfoIntern(id: number, body: InternUpdateBody) {
  prisma.intern.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

async function updateInfoGuard(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.guard.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.guard.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          // password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoAccountant(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.accountant.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.accountant.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          // password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoPatient(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.patient.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.patient.update({
    data: {
      tax_number: body.taxNumber,
      health_number: body.healthNumber,
      request: body.request,
      remarks: body.remarks,
      patienttype: {
        update: {
          id: body.patienttype_id,
        },
      },
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          // password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  // update school info
  var oldSchool = await prisma.school.findFirst({
    where: { patient_person_id: userId },
  })

  if (oldSchool) {
    prisma.school.update({
      where: { id: oldSchool.id },
      data: {
        name: body.schoolName,
        course: body.schoolCourse,
        grade: body.schoolGrade,
      },
    })
  }

  // update profession info
  var oldProfession = await prisma.profession.findFirst({
    where: { patient_person_id: userId },
  })

  if (oldProfession) {
    prisma.profession.update({
      where: { id: oldProfession.id },
      data: {
        name: body.professionName,
      },
    })
  }

  res.status(StatusCodes.OK).json({
    msg: "Success.",
  })
}

async function updateInfoPerson(body: any, res: Response, userId: number) {
  /**
   * Use this one to update accountant, guard and intern.
   * They don't have parameters in the respective entity.
   */
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.person.findUnique({ where: { id: userId } })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.person.update({
    data: {
      active: body.active,
      address: body.address,
      name: body.name,
      email: body.email,
      aproved: body.aproved,
      birth_date: body.birthDate,
      // password: await argon2.hash(body.password),
      phone_number: body.phoneNumber,
    },
    where: { id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}
