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
    await prisma.liable.deleteMany()

    // therapists
    let person1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Therapist",
            email: "therapist@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Brasil",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 9219231942,
            tax_number: 123124123,
        }
    })
    let therapist1 = await prisma.therapist.create({
        data: {
            extern: false,
            license: "2417",
            health_system: "public",
            person_id: person1.id,
        }
    })

    let person2 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "António",
            email: "antonio@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Parque Verde",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 912345678,
            tax_number: 231321123,
        }
    })
    let therapist2 = await prisma.therapist.create({
        data: {
            extern: true,
            license: "7217",
            health_system: "private",
            person_id: person2.id,
        }
    })

    let person11 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Diogo",
            email: "diogo@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Escuridão",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 912345678,
            tax_number: 231321123,
        }
    })
    // therapist admin
    let therapist3 = await prisma.therapist.create({
        data: {
            extern: true,
            license: "5368",
            health_system: "private",
            person_id: person11.id,
        }
    })
    // make him admin
    await prisma.admin.create({
        data: {
            person_id: person11.id,
        }
    })


    // interns
    let person3 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Intern",
            email: "intern@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Liberdade",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let intern1 = await prisma.intern.create({
        data: {
            person_id: person3.id,
        }
    })

    let person4 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Margarida",
            email: "margarida@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Sol",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 912345678,
            tax_number: 231321123,
        }
    })
    let intern2 = await prisma.intern.create({
        data: {
            person_id: person4.id,
        }
    })

    // admins
    let person5 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Admin",
            email: "admin@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Liderança",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let admin1 = await prisma.admin.create({
        data:{
            person_id: person5.id,
        }
    })

    let person6 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Carlos",
            email: "carlos@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Justiça",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let admin2 = await prisma.admin.create({
        data:{
            person_id: person6.id,
        }
    })

    // accountants
    let person7 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Accountant",
            email: "accountant@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Luz",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let accountant1 = await prisma.accountant.create({
        data:{
            person_id: person7.id,
        }
    })

    let person8 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Laura",
            email: "laura@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Noite",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let accountant2 = await prisma.accountant.create({
        data:{
            person_id: person8.id,
        }
    })

    // guards
    let person9 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Guard",
            email: "guard@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Achado",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let guard1 = await prisma.guard.create({
        data:{
            person_id: person9.id,
        }
    })

    let person10 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Alberto",
            email: "alberto@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Esquecido",
            birth_date: new Date("1990-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let guard2 = await prisma.guard.create({
        data:{
            person_id: person10.id,
        }
    })

    // patienttype
    let patientTypeChild = await prisma.patienttype.create({
        data: {
            type: "child",
        }
    })

    let patientTypeTeen = await prisma.patienttype.create({
        data: {
            type: "teen",
        }
    })

    let patientTypeAdult = await prisma.patienttype.create({
        data: {
            type: "adult",
        }
    })

    let patientTypeElder = await prisma.patienttype.create({
        data: {
            type: "elder",
        }
    })

    let patientTypeFamily = await prisma.patienttype.create({
        data: {
            type: "family",
        }
    })

    let patientTypeCouple = await prisma.patienttype.create({
        data: {
            type: "couple",
        }
    })

    // patients
        // child
    let personChild1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Pedro",
            email: "pedro@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Perdido",
            birth_date: new Date("2015-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientChild1 = await prisma.patient.create({
        data: {
            person_id: personChild1.id,
            health_number: 123456789,
            request: "Distúrbios comportamentais",
            remarks: "O paciente apresenta uma súbita mudança comportamental com os seus pares.",
            patienttype_id: patientTypeChild.id,
        }
    })
        // teen
    let personTeen1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Nuno",
            email: "nuno@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua da Fonte",
            birth_date: new Date("2007-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientTeen1 = await prisma.patient.create({
        data: {
            person_id: personTeen1.id,
            health_number: 123456788,
            request: "Problemas escolares",
            remarks: "O paciente apresenta uma súbita queda na performance escolar.",
            patienttype_id: patientTypeTeen.id,
        }
    })
        // adult
    let personAdult1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Alexandre",
            email: "alexandre@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Campo",
            birth_date: new Date("2000-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientAdult1 = await prisma.patient.create({
        data: {
            person_id: personAdult1.id,
            health_number: 123456787,
            request: "Problemas no trabalho",
            remarks: "O paciente queixa-se de que não está a conseguir concentrar-se no trabalho.",
            patienttype_id: patientTypeAdult.id,
        }
    })
        // elder
    let personElder1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Alfredo",
            email: "alfredo@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Rio",
            birth_date: new Date("1950-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientElder1 = await prisma.patient.create({
        data: {
            person_id: personElder1.id,
            health_number: 123456787,
            request: "Solidão",
            remarks: "O paciente diz que se sente sozinho e abandonado pela família e amigos.",
            patienttype_id: patientTypeElder.id,
        }
    })
        // family
            // 1
    let personFamily1Father = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Father",
            email: "father@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Céu",
            birth_date: new Date("1980-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientFamily1Father = await prisma.patient.create({
        data: {
            person_id: personFamily1Father.id,
            health_number: 123456787,
            request: "Problemas com o filho",
            remarks: "Os pais dizem que o filho não os respeita e quando chamado à atenção faz birra.",
            patienttype_id: patientTypeFamily.id,
        }
    })
            // 2
    let personFamily1Mother = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Mother",
            email: "mother@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Céu",
            birth_date: new Date("1984-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientFamily1Mother = await prisma.patient.create({
        data: {
            person_id: personFamily1Mother.id,
            health_number: 123456787,
            request: "Problemas com o filho",
            remarks: "Os pais dizem que o filho não os respeita e quando chamado à atenção faz birra.",
            patienttype_id: patientTypeFamily.id,
        }
    })
            // 3
    let personFamily1Child1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Son",
            email: "son@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Céu",
            birth_date: new Date("2014-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientFamily1Child1 = await prisma.patient.create({
        data: {
            person_id: personFamily1Child1.id,
            health_number: 123456787,
            request: "Problemas com o filho",
            remarks: "Os pais dizem que o filho não os respeita e quando chamado à atenção faz birra.",
            patienttype_id: patientTypeFamily.id,
        }
    })
        // couple
            // 1
    let personCouple1Boy1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Rapaz",
            email: "rapaz@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Vento",
            birth_date: new Date("1995-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientCouple1Boy1 = await prisma.patient.create({
        data: {
            person_id: personCouple1Boy1.id,
            health_number: 123456787,
            request: "Problemas no relacionamento",
            remarks: "Os membros do casal dizem estar a perder a ligação.",
            patienttype_id: patientTypeCouple.id,
        }
    })
            // 2
    let personCouple1Girl1 = await prisma.person.create({
        data: {
            active: true,
            verified: true,
            approved: true,
            name: "Rapariga",
            email: "rapariga@student.dei.uc.pt",
            password: await argon2.hash("12345"),
            address: "Rua do Vento",
            birth_date: new Date("1994-11-21T23:50:28.538Z"),
            phone_number: 987654321,
            tax_number: 718906543,
        }
    })
    let patientCouple1Girl1 = await prisma.patient.create({
        data: {
            person_id: personCouple1Girl1.id,
            health_number: 123456787,
            request: "Problemas no relacionamento",
            remarks: "Os membros do casal dizem estar a perder a ligação.",
            patienttype_id: patientTypeCouple.id,
        }
    })

    // rooms
    let room1 = await prisma.room.create({
        data: {
            name: "sala1"
        }
    })

    let room2 = await prisma.room.create({
        data: {
            name: "sala2"
        }
    })

    let room3 = await prisma.room.create({
        data: {
            name: "sala3"
        }
    })

    // specialities
    let specialityCouple = await prisma.speciality.create({
        data: {
            code: "TCasal",
            description: "Terapia de casal",
            speciality: "terapia_casal",
        }
    })

    let specialityFamily = await prisma.speciality.create({
        data: {
            code: "TFamília",
            description: "Terapia de família",
            speciality: "terapia_família",
        }
    })

    let specialityAdult = await prisma.speciality.create({
        data: {
            code: "TAdulto",
            description: "Terapia de adulto",
            speciality: "terapia_adulto",
        }
    })

    let specialityTeen = await prisma.speciality.create({
        data: {
            code: "TAdolescente",
            description: "Terapia de adolescente",
            speciality: "terapia_adolescente",
        }
    })

    let specialityChild = await prisma.speciality.create({
        data: {
            code: "TCriança",
            description: "Terapia de criança",
            speciality: "terapia_criança",
        }
    })

    let specialityElder = await prisma.speciality.create({
        data: {
            code: "TIdoso",
            description: "Terapia de idoso",
            speciality: "terapia_idoso",
        }
    })

    // prices
    let priceChild = await prisma.pricetable.create({
        data: {
            id: specialityChild.code,
            type: specialityChild.speciality,
            price: 30,
        }
    })

    let priceTeen = await prisma.pricetable.create({
        data: {
            id: specialityTeen.code,
            type: specialityTeen.speciality,
            price: 35,
        }
    })

    let priceAdult = await prisma.pricetable.create({
        data: {
            id: specialityAdult.code,
            type: specialityAdult.speciality,
            price: 60,
        }
    })

    let priceElder = await prisma.pricetable.create({
        data: {
            id: specialityElder.code,
            type: specialityElder.speciality,
            price: 60,
        }
    })

    let priceCouple = await prisma.pricetable.create({
        data: {
            id: specialityCouple.code,
            type: specialityCouple.speciality,
            price: 80,
        }
    })

    let priceFamily = await prisma.pricetable.create({
        data: {
            id: specialityFamily.code,
            type: specialityFamily.speciality,
            price: 100,
        }
    })
    
    // notifications

    // processes
    // [ PROCESS CHILD ]
    // create process
    let processChild1 = await prisma.process.create({
        data: {
            ref: `${specialityChild.code}_${personChild1.name}`,
            active: true,
            remarks: "Observações do processo no geral.",
            speciality_speciality: specialityChild.speciality,
        }
    })
    // add patient (create link)
    await prisma.patient_process.create({data: {patient_person_id: patientChild1.person_id, process_id: processChild1.id}});
    // add appointments
    let appointment1ProcessChild1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room1.id,
            pricetable_id: priceChild.id,
            slot_start_date: new Date("2023-01-31T10:00:00.000Z"),
            slot_end_date: new Date("2023-01-31T11:00:00.000Z"),
            active: true,
          }
    })

    let appointment2ProcessChild1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room1.id,
            pricetable_id: priceChild.id,
            slot_start_date: new Date("2023-02-01T10:00:00.000Z"),
            slot_end_date: new Date("2023-02-01T11:00:00.000Z"),
            active: true,
          }
    })

    let appointment3ProcessChild1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room1.id,
            pricetable_id: priceChild.id,
            slot_start_date: new Date("2023-02-02T10:00:00.000Z"),
            slot_end_date: new Date("2023-02-02T11:00:00.000Z"),
            active: true,
          }
    })

    let appointment4ProcessChild1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room1.id,
            pricetable_id: priceChild.id,
            slot_start_date: new Date("2023-02-03T10:00:00.000Z"),
            slot_end_date: new Date("2023-02-03T11:00:00.000Z"),
            active: true,
          }
    })

    let appointment5ProcessChild1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room1.id,
            pricetable_id: priceChild.id,
            slot_start_date: new Date("2023-02-04T10:00:00.000Z"),
            slot_end_date: new Date("2023-02-04T11:00:00.000Z"),
            active: true,
          }
    })

    // archive appointment
    await prisma.appointment.update({
        where: {
            slot_id: appointment1ProcessChild1.slot_id
        },
        data: {
            archived_date: new Date("2023-01-31T11:00:00.000Z"),
            active: false,
        }
    })

    // add notes
    if (appointment1ProcessChild1.archived_date != null){
        await prisma.notes.create({
            data: {
            title: "Primeira consulta",
            body: "O paciente não se sentiu à vontade para falar comigo.",
            datetime: new Date(appointment1ProcessChild1.archived_date),
            process_id: processChild1.id,
            },
        })
    }

    // add receipts
    if (appointment1ProcessChild1.archived_date != null){
        let receiptAppointment1ProcessChild1 = await prisma.receipt.create({
            data: {
            ref: `${processChild1.ref}_${appointment1ProcessChild1.archived_date}`,
            datetime: new Date(appointment1ProcessChild1.archived_date),
            payed: true,
            appointment_slot_id: appointment1ProcessChild1.slot_id,
            },
        })
    }

    // [ PROCESS TEEN ]
    // create process
    let processTeen1 = await prisma.process.create({
        data: {
            ref: `${specialityTeen.code}_${personTeen1.name}`,
            active: true,
            remarks: "Observações do processo no geral.",
            speciality_speciality: specialityTeen.speciality,
        }
    })
    // add patient (create link)
    await prisma.patient_process.create({data: {patient_person_id: patientTeen1.person_id, process_id: processTeen1.id}});
    // add appointments
    let appointment1ProcessTeen1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room2.id,
            pricetable_id: priceTeen.id,
            slot_start_date: new Date("2023-01-31T11:00:00.000Z"),
            slot_end_date: new Date("2023-01-31T12:00:00.000Z"),
            active: true,
          }
    })

    let appointment2ProcessTeen1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room2.id,
            pricetable_id: priceTeen.id,
            slot_start_date: new Date("2023-02-01T11:00:00.000Z"),
            slot_end_date: new Date("2023-02-01T12:00:00.000Z"),
            active: true,
          }
    })

    let appointment3ProcessTeen1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room2.id,
            pricetable_id: priceTeen.id,
            slot_start_date: new Date("2023-02-02T11:00:00.000Z"),
            slot_end_date: new Date("2023-02-02T12:00:00.000Z"),
            active: true,
          }
    })

    let appointment4ProcessTeen1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room2.id,
            pricetable_id: priceTeen.id,
            slot_start_date: new Date("2023-02-03T10:00:00.000Z"),
            slot_end_date: new Date("2023-02-03T11:00:00.000Z"),
            active: true,
          }
    })

    let appointment5ProcessTeen1 = await prisma.appointment.create({
        data: {
            online: false,
            room_id: room2.id,
            pricetable_id: priceTeen.id,
            slot_start_date: new Date("2023-02-04T10:00:00.000Z"),
            slot_end_date: new Date("2023-02-04T11:00:00.000Z"),
            active: true,
          }
    })

    // archive appointment
    await prisma.appointment.update({
        where: {
            slot_id: appointment1ProcessTeen1.slot_id
        },
        data: {
            archived_date: "2023-01-31T11:00:00.000Z",
            active: false,
        }
    })

    // add notes
    if (appointment1ProcessChild1.archived_date != null){
        await prisma.notes.create({
            data: {
            title: "Primeira consulta",
            body: "O paciente não se sentiu à vontade para falar comigo.",
            datetime: new Date(appointment1ProcessChild1.archived_date),
            process_id: processChild1.id,
            },
        })
    }

    // add receipts
    if (appointment1ProcessChild1.archived_date != null){
        let receiptAppointment1ProcessChild1 = await prisma.receipt.create({
            data: {
            ref: `${processChild1.ref}_${appointment1ProcessChild1.archived_date}`,
            datetime: new Date(appointment1ProcessChild1.archived_date),
            payed: true,
            appointment_slot_id: appointment1ProcessChild1.slot_id,
            },
        })
    }

}

export default { seed }
