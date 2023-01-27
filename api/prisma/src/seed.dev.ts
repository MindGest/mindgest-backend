import prisma from "../../src/utils/prisma"
import argon2 from "argon2"

async function seed() {
  let person1 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "terapeuta",
      email: "terapeuta@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231942,
      tax_number: 123124123,
    },
  })

  let therapist1 = await prisma.therapist.create({
    data:{
      extern: false,
      license: "blabla",
      health_system: "blabla",
      person_id: person1.id
    }
  })

  let person2 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "utente",
      email: "utente@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231932,
      tax_number: 123124124,
    },
  })

  let patientType = await prisma.patienttype.create({
    data:{
      type:"ola"
    }
  })


  let utente = await prisma.patient.create({
    data:{
      health_number:12231,
      request: "ola",
      remarks: "ola",
      patienttype_id: patientType.id,
      person_id: person2.id
    }
  })

  let profession = await prisma.profession.create({
    data:{
      name:"proxeneta",
      
    }
  })
}


export default { seed }
