import argon2 from "argon2"

import {
  AccountantUpdateBody,
  AdminUpdateBody,
  GuardUpdateBody,
  InternUpdateBody,
  SelfAccountantUpdateBody,
  SelfAdminUpdateBody,
  SelfGuardUpdateBody,
  SelfInternUpdateBody,
  SelfTherapistUpdateBody,
  TherapistUpdateBody,
} from "../utils/types"

import prisma from "../utils/prisma"
import { User } from "../utils/schemas"

let UNDEFINED = "OHMANINHOQUERESPORRADA??!!??!!??"

export async function fetchPersonProperties(personId: bigint) {
  let therapist = await prisma.therapist.findUnique({
    where: { person_id: personId },
  })
  if (therapist)
    return {
      isAdmin:
        (await prisma.admin.findUnique({
          where: { person_id: personId },
        })) !== null,
      userRole: User.THERAPIST,
    }

  let admin = await prisma.admin.findUnique({
    where: { person_id: personId },
  })
  if (admin) return { isAdmin: true, userRole: User.ADMIN }

  let intern = await prisma.intern.findUnique({
    where: { person_id: personId },
  })
  if (intern) return { isAdmin: false, userRole: User.INTERN }

  let guard = await prisma.guard.findUnique({
    where: { person_id: personId },
  })
  if (guard) return { isAdmin: false, userRole: User.GUARD }

  let accountant = await prisma.accountant.findUnique({
    where: { person_id: personId },
  })
  if (accountant) return { isAdmin: false, userRole: User.ACCOUNTANT }

  return { isAdmin: true, userRole: User.THERAPIST }
}

export async function updateInfoTherapist(id: number, body: TherapistUpdateBody) {
  await prisma.therapist.update({
    data: {
      extern: body.extern,
      license: body.license,
      health_system: body.healthSystem,
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          approved: body.approved,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function selfUpdateInfoTherapist(id: number, body: SelfTherapistUpdateBody) {
  await prisma.therapist.update({
    data: {
      license: body.license,
      extern: body.extern,
      health_system: body.healthSystem,
      person: {
        update: {
          address: body.address,
          name: body.name,
          email: body.email,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function updateInfoIntern(id: number, body: InternUpdateBody) {
  await prisma.intern.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          approved: body.approved,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function selfUpdateInfoIntern(id: number, body: SelfInternUpdateBody) {
  await prisma.intern.update({
    data: {
      person: {
        update: {
          address: body.address,
          name: body.name,
          email: body.email,
          birth_date: body.birthDate,
          password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function updateInfoAdmin(id: number, body: AdminUpdateBody) {
  await prisma.admin.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          approved: body.approved,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function selfUpdateInfoAdmin(id: number, body: SelfAdminUpdateBody) {
  await prisma.admin.update({
    data: {
      person: {
        update: {
          address: body.address,
          name: body.name,
          email: body.email,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function updateInfoGuard(id: number, body: GuardUpdateBody) {
  await prisma.guard.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          approved: body.approved,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function selfUpdateInfoGuard(id: number, body: SelfGuardUpdateBody) {
  await prisma.guard.update({
    data: {
      person: {
        update: {
          address: body.address,
          name: body.name,
          email: body.email,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function updateInfoAccountant(id: number, body: AccountantUpdateBody) {
  await prisma.accountant.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          approved: body.approved,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.taxNumber,
        },
      },
    },
    where: { person_id: id },
  })
}

export async function selfUpdateInfoAccountant(id: number, body: SelfAccountantUpdateBody) {
  console.log(body.password)
  if (body.password !== UNDEFINED) {
    await prisma.accountant.update({
      data: {
        person: {
          update: {
            address: body.address,
            name: body.name,
            email: body.email,
            birth_date: body.birthDate,
            phone_number: body.phoneNumber,
            tax_number: body.taxNumber,
          },
        },
      },
      where: { person_id: id },
    })
  } else {
    await prisma.accountant.update({
      data: {
        person: {
          update: {
            address: body.address,
            name: body.name,
            email: body.email,
            birth_date: body.birthDate,
            phone_number: body.phoneNumber,
            tax_number: body.taxNumber,
          },
        },
      },
      where: { person_id: id },
    })
  }
}

export async function updateInfoPatient(id: number, body: any) {
  await prisma.patient.update({
    data: {
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
          approved: body.approved,
          birth_date: body.birthDate,
          phone_number: body.phoneNumber,
          tax_number: body.tax_number,
        },
      },
    },
    where: { person_id: id },
  })

  // update school info
  var oldSchool = await prisma.school.findFirst({
    where: { patient_person_id: id },
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
    where: { patient_person_id: id },
  })

  if (oldProfession) {
    prisma.profession.update({
      where: { id: oldProfession.id },
      data: {
        name: body.professionName,
      },
    })
  }
}

export default {
  updateInfoTherapist,
  selfUpdateInfoTherapist,
  updateInfoGuard,
  selfUpdateInfoGuard,
  updateInfoAccountant,
  selfUpdateInfoAccountant,
  updateInfoIntern,
  selfUpdateInfoIntern,
  updateInfoAdmin,
  selfUpdateInfoAdmin,
  updateInfoPatient,
}
