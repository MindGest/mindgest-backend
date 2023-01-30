import prisma from "../../src/utils/prisma"
import argon2 from "argon2"

async function seed() {
  await prisma.appointment_process.deleteMany({})
  await prisma.therapist_speciality.deleteMany({})
  await prisma.school.deleteMany({})
  await prisma.profession.deleteMany({})
  await prisma.accountant.deleteMany({})
  await prisma.guard.deleteMany({})
  await prisma.admin.deleteMany({})
  await prisma.intern_process.deleteMany({})
  await prisma.process_liable.deleteMany({})
  await prisma.notes.deleteMany({})
  await prisma.notifications.deleteMany({})
  await prisma.intern.deleteMany({})
  await prisma.patient_process.deleteMany({})
  await prisma.patient.deleteMany({})
  await prisma.patienttype.deleteMany({})
  await prisma.therapist_process.deleteMany({})
  await prisma.therapist.deleteMany({})
  await prisma.receipt.deleteMany({})
  await prisma.appointment.deleteMany({})
  await prisma.permissions.deleteMany({})
  await prisma.pricetable.deleteMany({})
  await prisma.process.deleteMany({})
  await prisma.speciality.deleteMany({})
  await prisma.person.deleteMany({})
  await prisma.room.deleteMany({})

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

  let therapist = await prisma.therapist.create({
    data: {
      extern: false,
      license: "blabla",
      health_system: "blabla",
      person_id: person1.id,
    },
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
    data: {
      type: "burro",
    },
  })

  let utente = await prisma.patient.create({
    data: {
      health_number: 12231,
      request: "burro",
      remarks: "burro e parvo",
      patienttype_id: patientType.id,
      person_id: person2.id,
    },
  })

  await prisma.profession.create({
    data: {
      name: "proxeneta",
      patient_person_id: utente.person_id,
    },
  })

  await prisma.school.create({
    data: {
      name: "escola dos burros",
      course: "burrice",
      grade: 18,
      patient_person_id: person2.id,
    },
  })

  let person3 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "accountant",
      email: "accountant@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9213231942,
      tax_number: 123124223,
    },
  })

  let accountant = await prisma.accountant.create({
    data: {
      person_id: person3.id,
    },
  })

  let person4 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "guard",
      email: "guard@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9313231942,
      tax_number: 123124223,
    },
  })

  let guard = await prisma.guard.create({
    data: {
      person_id: person4.id,
    },
  })

  let person5 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "intern",
      email: "intern@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9313231942,
      tax_number: 1233124223,
    },
  })

  let intern = await prisma.intern.create({
    data: {
      person_id: person5.id,
    },
  })

  let person6 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "admin",
      email: "admin@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9313231942,
      tax_number: 1233124223,
    },
  })

  let admin = await prisma.admin.create({
    data: {
      person_id: person6.id,
    },
  })

  let speciality = await prisma.speciality.create({
    data: {
      speciality: "burrice",
      code: "burr123",
      description: "bued burros",
    },
  })

  let process = await prisma.process.create({
    data: {
      ref: "tard123",
      active: true,
      remarks: "é bue burro",
      speciality_speciality: speciality.speciality,
    },
  })

  await prisma.therapist_speciality.create({
    data: {
      speciality_speciality: speciality.speciality,
      therapist_person_id: person1.id,
    },
  })

  await prisma.therapist_process.create({
    data: {
      therapist_person_id: person1.id,
      process_id: process.id,
    },
  })

  await prisma.patient_process.create({
    data: {
      process_id: process.id,
      patient_person_id: person2.id,
    },
  })

  let room1 = await prisma.room.create({
    data: {
      name: "sala para burros",
    },
  })

  let pricetable1 = await prisma.pricetable.create({
    data: {
      id: "burritos",
      type: "burritos",
      price: 23.2,
    },
  })

  let appointment1 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room1.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-31T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-31T03:50:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-31T22:50:28.538Z"),
    },
  })

  let appointment2 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room1.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-22T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-22T03:50:28.538Z"),
      active: true,
      archived_date: new Date("2023-01-22T22:50:28.538Z"),
    },
  })

  let appointment3 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room1.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-30T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-30T03:50:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-30T22:50:28.538Z"),
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process.id,
      appointment_slot_id: appointment1.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process.id,
      appointment_slot_id: appointment2.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process.id,
      appointment_slot_id: appointment3.slot_id,
    },
  })

  let receipt1 = await prisma.receipt.create({
    data: {
      ref: "istoechato",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment2.slot_id,
    },
  })

  await prisma.permissions.create({
    data: {
      editpatitent: true,
      editprocess: true,
      see: true,
      appoint: true,
      statitics: true,
      archive: true,
      isMain: true,
      process_id: process.id,
      person_id: person1.id,
    },
  })

  await prisma.intern_process.create({
    data: {
      process_id: process.id,
      intern_person_id: person5.id,
    },
  })

  await prisma.speciality.create({
    data: {
      code: "TX",
      description: "Terapia X",
      speciality: "TerapiaX",
    },
  })

  await prisma.permissions.create({
    data: {
      editpatitent: false,
      editprocess: false,
      see: false,
      appoint: false,
      statitics: false,
      archive: false,
      isMain: false,
      process_id: process.id,
      person_id: person5.id,
    },
  })

  let liable = await prisma.liable.create({
    data: {
      name: "Pai do burro",
      email: "paidoburro@gmail.com",
      phonenumber: 91312312,
      type: "Pai",
      remarks: "Ele é mesmo burro pah",
    },
  })

  await prisma.process_liable.create({
    data: {
      process_id: process.id,
      liable_id: liable.id,
    },
  })

  await prisma.notifications.create({
    data: {
      ref: "12345",
      type: "Teste123",
      data: "Teste123",
      seen: false,
      settled: false,
      person_id: person6.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "ele é burro",
      body: "IMANINHOCABURRO",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      process_id: process.id,
    },
  })
}

export default { seed }
