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
    
    // interns

    // admins

    // accountants

    // guards

    // patients
        // professions
        // schools

    // rooms

    // prices

    // specialities

    // notifications

    // processes
        // appointments
        // notes
        // receipt

}

export default { seed }
