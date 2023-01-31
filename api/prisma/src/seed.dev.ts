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

  let person12 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "utente2",
      email: "utente2@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231932,
      tax_number: 123124124,
    },
  })

  let person13 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "utente3",
      email: "utente3@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231932,
      tax_number: 123124124,
    },
  })
  let person14 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "utente4",
      email: "utente4@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231932,
      tax_number: 123124124,
    },
  })

  let patientType = await prisma.patienttype.create({
    data: {
      type: "criança",
    },
  })

  let patientType2 = await prisma.patienttype.create({
    data: {
      type: "adulto",
    },
  })

  let patientType3 = await prisma.patienttype.create({
    data: {
      type: "velho",
    },
  })

  let utente = await prisma.patient.create({
    data: {
      health_number: 12231,
      request: "quero cenas",
      remarks: "precisa de cenas",
      patienttype_id: patientType.id,
      person_id: person2.id,
    },
  })

  let utente2 = await prisma.patient.create({
    data: {
      health_number: 12232,
      request: "quero cenas 2",
      remarks: "precisa de cenas 2",
      patienttype_id: patientType2.id,
      person_id: person12.id,
    },
  })

  let utente3 = await prisma.patient.create({
    data: {
      health_number: 12232,
      request: "quero cenas 3",
      remarks: "precisa de cenas 3",
      patienttype_id: patientType3.id,
      person_id: person13.id,
    },
  })

  let utente4 = await prisma.patient.create({
    data: {
      health_number: 12232,
      request: "quero cenas 4",
      remarks: "precisa de cenas 4",
      patienttype_id: patientType3.id,
      person_id: person14.id,
    },
  })

  await prisma.profession.create({
    data: {
      name: "estudante",
      patient_person_id: utente.person_id,
    },
  })

  await prisma.profession.create({
    data: {
      name: "capitão iglo",
      patient_person_id: utente2.person_id,
    },
  })

  await prisma.profession.create({
    data: {
      name: "ginasta",
      patient_person_id: utente3.person_id,
    },
  })

  await prisma.school.create({
    data: {
      name: "amadora",
      course: "carpintaria",
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

  let person7 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "intern2",
      email: "intern2@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9313231942,
      tax_number: 1233124223,
    },
  })

  let intern2 = await prisma.intern.create({
    data: {
      person_id: person7.id,
    },
  })

  let person8 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "intern3",
      email: "intern3@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9313231942,
      tax_number: 1233124223,
    },
  })

  let intern3 = await prisma.intern.create({
    data: {
      person_id: person8.id,
    },
  })

  let person9 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "terapeuta1",
      email: "terapeuta1@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231942,
      tax_number: 123124123,
    },
  })

  let therapist1 = await prisma.therapist.create({
    data: {
      extern: false,
      license: "blabla",
      health_system: "blabla",
      person_id: person9.id,
    },
  })

  let person10 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "terapeuta2",
      email: "terapeuta2@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231942,
      tax_number: 123124123,
    },
  })

  let therapist2 = await prisma.therapist.create({
    data: {
      extern: false,
      license: "blabla",
      health_system: "blabla",
      person_id: person10.id,
    },
  })

  let person11 = await prisma.person.create({
    data: {
      active: true,
      verified: true,
      approved: true,
      name: "terapeuta3",
      email: "terapeuta3@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231942,
      tax_number: 123124123,
    },
  })

  let therapist3 = await prisma.therapist.create({
    data: {
      extern: false,
      license: "blabla",
      health_system: "blabla",
      person_id: person11.id,
    },
  })

  let speciality = await prisma.speciality.create({
    data: {
      speciality: "familia",
      code: "fam123",
      description: "familiy",
    },
  })

  let speciality2 = await prisma.speciality.create({
    data: {
      speciality: "trauma",
      code: "tram123",
      description: "bued traumas",
    },
  })

  let speciality3 = await prisma.speciality.create({
    data: {
      speciality: "relações",
      code: "rel123",
      description: "bued relações humanas",
    },
  })

  let speciality4 = await prisma.speciality.create({
    data: {
      speciality: "violation",
      code: "viol123",
      description: "bued violations",
    },
  })

  let process = await prisma.process.create({
    data: {
      ref: "tard123",
      active: true,
      remarks: "quer cenas",
      speciality_speciality: speciality.speciality,
    },
  })

  let process2 = await prisma.process.create({
    data: {
      ref: "wefdewfw",
      active: true,
      remarks: "manmanman",
      speciality_speciality: speciality2.speciality,
    },
  })

  let process3 = await prisma.process.create({
    data: {
      ref: "ferfer",
      active: true,
      remarks: "mimimi",
      speciality_speciality: speciality3.speciality,
    },
  })

  let process4 = await prisma.process.create({
    data: {
      ref: "sdss",
      active: true,
      remarks: "novo processo da senhora mandona",
      speciality_speciality: speciality4.speciality,
    },
  })


  await prisma.therapist_speciality.create({
    data: {
      speciality_speciality: speciality.speciality,
      therapist_person_id: person1.id,
    },
  })

  await prisma.therapist_speciality.create({
    data: {
      speciality_speciality: speciality2.speciality,
      therapist_person_id: person9.id,
    },
  })

  await prisma.therapist_speciality.create({
    data: {
      speciality_speciality: speciality2.speciality,
      therapist_person_id: person10.id,
    },
  })

  await prisma.therapist_speciality.create({
    data: {
      speciality_speciality: speciality3.speciality,
      therapist_person_id: person10.id,
    },
  })

  await prisma.therapist_speciality.create({
    data: {
      speciality_speciality: speciality4.speciality,
      therapist_person_id: person11.id,
    },
  })

  await prisma.therapist_process.create({
    data: {
      therapist_person_id: person1.id,
      process_id: process.id,
    },
  })

  await prisma.therapist_process.create({
    data: {
      therapist_person_id: person9.id,
      process_id: process2.id,
    },
  })

  await prisma.therapist_process.create({
    data: {
      therapist_person_id: person10.id,
      process_id: process2.id,
    },
  })

  await prisma.therapist_process.create({
    data: {
      therapist_person_id: person10.id,
      process_id: process3.id,
    },
  })

  await prisma.therapist_process.create({
    data: {
      therapist_person_id: person11.id,
      process_id: process4.id,
    },
  })

  await prisma.patient_process.create({
    data: {
      process_id: process.id,
      patient_person_id: person2.id,
    },
  })

  await prisma.patient_process.create({
    data: {
      process_id: process2.id,
      patient_person_id: utente2.person_id,
    },
  })

  await prisma.patient_process.create({
    data: {
      process_id: process3.id,
      patient_person_id: utente3.person_id,
    },
  })

  await prisma.patient_process.create({
    data: {
      process_id: process4.id,
      patient_person_id: utente4.person_id,
    },
  })

  let room1 = await prisma.room.create({
    data: {
      name: "sala para burros",
    },
  })

  let room2 = await prisma.room.create({
    data: {
      name: "X",
    },
  })

  let room3 = await prisma.room.create({
    data: {
      name: "Y",
    },
  })

  let room4 = await prisma.room.create({
    data: {
      name: "Z",
    },
  })

  let pricetable1 = await prisma.pricetable.create({
    data: {
      id: "esp1",
      type: "esp1",
      price: 23.2,
    },
  })

  let pricetable2 = await prisma.pricetable.create({
    data: {
      id: "esp2",
      type: "esp2",
      price: 23.2,
    },
  })

  let pricetable3 = await prisma.pricetable.create({
    data: {
      id: "esp3",
      type: "esp3",
      price: 23.2,
    },
  })

  //PROCESSO 1

  let appointment1 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room1.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-31T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-31T03:50:28.538Z"),
      active: false,
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
      name: "Pai",
      email: "pai@gmail.com",
      phonenumber: 91312312,
      type: "Pai",
      remarks: "Ele pah",
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
      title: "testagem",
      body: "teste",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      process_id: process.id,
    },
  })

  //PROCESSO 2
  let appointment4 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room2.id,
      pricetable_id: pricetable2.id,
      slot_start_date: new Date("2023-01-31T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-31T03:50:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-31T22:50:28.538Z"),
    },
  })

  let appointment5 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room2.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-22T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-22T03:50:28.538Z"),
      active: true,
      archived_date: new Date("2023-01-22T22:50:28.538Z"),
    },
  })

  let appointment6 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room2.id,
      pricetable_id: pricetable3.id,
      slot_start_date: new Date("2023-01-30T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-30T03:50:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-30T22:50:28.538Z"),
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process2.id,
      appointment_slot_id: appointment4.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process2.id,
      appointment_slot_id: appointment5.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process2.id,
      appointment_slot_id: appointment6.slot_id,
    },
  })

  let receipt2 = await prisma.receipt.create({
    data: {
      ref: "asdasd",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment5.slot_id,
    },
  })

  let receipt3 = await prisma.receipt.create({
    data: {
      ref: "breasdadhbrah",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment6.slot_id,
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
      person_id: person9.id,
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
      person_id: person10.id,
    },
  })

  await prisma.intern_process.create({
    data: {
      process_id: process.id,
      intern_person_id: intern3.person_id,
    },
  })

  await prisma.speciality.create({
    data: {
      code: "TXY",
      description: "Terapia Y",
      speciality: "TerapiaY",
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
      person_id: intern2.person_id,
    },
  })

  let liable2 = await prisma.liable.create({
    data: {
      name: "Marcao",
      email: "marco@gmail.com",
      phonenumber: 91312312,
      type: "Avo",
      remarks: "Teste123",
    },
  })

  await prisma.process_liable.create({
    data: {
      process_id: process2.id,
      liable_id: liable2.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "coiso coiso",
      body: "coisao coisao",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      process_id: process2.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "coisa coisa",
      body: "brsfdf",
      datetime: new Date("2023-02-01T22:50:28.538Z"),
      process_id: process2.id,
    },
  })

  //Processo 3
  let appointment7 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room3.id,
      pricetable_id: pricetable2.id,
      slot_start_date: new Date("2023-01-31T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-31T03:50:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-31T22:50:28.538Z"),
    },
  })

  let appointment8 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room3.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-21T12:50:28.538Z"),
      slot_end_date: new Date("2023-01-21T13:50:28.538Z"),
      active: true,
      archived_date: new Date("2023-01-21T13:50:28.538Z"),
    },
  })

  let appointment9 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room3.id,
      pricetable_id: pricetable3.id,
      slot_start_date: new Date("2023-01-30T15:00:28.538Z"),
      slot_end_date: new Date("2023-01-30T16:00:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-30T16:50:28.538Z"),
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process3.id,
      appointment_slot_id: appointment7.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process3.id,
      appointment_slot_id: appointment8.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process3.id,
      appointment_slot_id: appointment9.slot_id,
    },
  })

  let receipt4 = await prisma.receipt.create({
    data: {
      ref: "brehbrehsda",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment8.slot_id,
    },
  })

  let receipt5 = await prisma.receipt.create({
    data: {
      ref: "asdadsa",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment5.slot_id,
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
      process_id: process3.id,
      person_id: person10.id,
    },
  })

  await prisma.intern_process.create({
    data: {
      process_id: process3.id,
      intern_person_id: intern2.person_id,
    },
  })

  await prisma.intern_process.create({
    data: {
      process_id: process3.id,
      intern_person_id: intern3.person_id,
    },
  })

  await prisma.speciality.create({
    data: {
      code: "TXZ",
      description: "Terapia Z",
      speciality: "TerapiaZ",
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
      person_id: intern2.person_id,
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
      person_id: intern3.person_id,
    },
  })

  let liable3 = await prisma.liable.create({
    data: {
      name: "Marquito",
      email: "marquito@gmail.com",
      phonenumber: 91312312,
      type: "Bisavo",
      remarks: "Teste123",
    },
  })

  await prisma.process_liable.create({
    data: {
      process_id: process3.id,
      liable_id: liable3.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "coiso coiso",
      body: "coisao coisao",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      process_id: process3.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "coisa coisa",
      body: "brsfdf",
      datetime: new Date("2023-02-01T22:50:28.538Z"),
      process_id: process3.id,
    },
  })

  //Processo 4
  let appointment10 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room3.id,
      pricetable_id: pricetable2.id,
      slot_start_date: new Date("2023-01-31T22:50:28.538Z"),
      slot_end_date: new Date("2023-01-31T03:50:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-31T22:50:28.538Z"),
    },
  })

  let appointment11 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room3.id,
      pricetable_id: pricetable3.id,
      slot_start_date: new Date("2023-01-21T12:50:28.538Z"),
      slot_end_date: new Date("2023-01-21T13:50:28.538Z"),
      active: true,
      archived_date: new Date("2023-01-21T13:50:28.538Z"),
    },
  })

  let appointment12 = await prisma.appointment.create({
    data: {
      online: false,
      room_id: room3.id,
      pricetable_id: pricetable1.id,
      slot_start_date: new Date("2023-01-30T15:00:28.538Z"),
      slot_end_date: new Date("2023-01-30T16:00:28.538Z"),
      active: false,
      archived_date: new Date("2023-01-30T16:50:28.538Z"),
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process4.id,
      appointment_slot_id: appointment10.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process4.id,
      appointment_slot_id: appointment11.slot_id,
    },
  })

  await prisma.appointment_process.create({
    data: {
      process_id: process4.id,
      appointment_slot_id: appointment12.slot_id,
    },
  })

  let receipt6 = await prisma.receipt.create({
    data: {
      ref: "fsdfs",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment11.slot_id,
    },
  })

  let receipt7 = await prisma.receipt.create({
    data: {
      ref: "asdasdasd",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      payed: true,
      appointment_slot_id: appointment10.slot_id,
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
      process_id: process4.id,
      person_id: person11.id,
    },
  })

  await prisma.intern_process.create({
    data: {
      process_id: process4.id,
      intern_person_id: intern2.person_id,
    },
  })

  await prisma.intern_process.create({
    data: {
      process_id: process4.id,
      intern_person_id: intern3.person_id,
    },
  })

  await prisma.speciality.create({
    data: {
      code: "TXW",
      description: "Terapia W",
      speciality: "TerapiaW",
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
      person_id: intern2.person_id,
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
      person_id: intern3.person_id,
    },
  })

  let liable4 = await prisma.liable.create({
    data: {
      name: "Marquita",
      email: "marquita@gmail.com",
      phonenumber: 91312312,
      type: "Mãe",
      remarks: "Teste123",
    },
  })

  await prisma.process_liable.create({
    data: {
      process_id: process4.id,
      liable_id: liable4.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "coiso coiso",
      body: "coisao coisao",
      datetime: new Date("2023-01-22T22:50:28.538Z"),
      process_id: process4.id,
    },
  })

  await prisma.notes.create({
    data: {
      title: "coisa coisa",
      body: "brsfdf",
      datetime: new Date("2023-02-01T22:50:28.538Z"),
      process_id: process4.id,
    },
  })
}

export default { seed }
