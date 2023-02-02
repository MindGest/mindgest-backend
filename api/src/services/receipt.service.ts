import prisma from "../utils/prisma"

export async function buildReceipt(appointmentId: number) {
  const receipt = await prisma.receipt.findFirst({
    where: { appointment: { slot_id: Number(appointmentId) } },
  })

  if (receipt === null || receipt === undefined) return null

  const appointment_process = await prisma.appointment_process.findFirst({
    where: { appointment: { slot_id: Number(appointmentId) } },
  })

  const appointment = await prisma.appointment.findFirst({
    where: { slot_id: Number(appointmentId) },
  })

  const patient_process = await prisma.patient_process.findFirst({
    where: {
      process_id: appointment_process?.process_id,
    },
  })
  const patient = await prisma.patient.findFirst({
    where: { person_id: patient_process?.patient_person_id },
  })

  const person = await prisma.person.findFirst({
    where: { id: patient_process?.patient_person_id },
  })

  const price = await prisma.pricetable.findFirst({
    where: { id: appointment?.pricetable_id },
  })

  const mainTherapistPermission = await prisma.permissions.findFirst({
    where: { process_id: patient_process?.process_id, isMain: true },
  })

  const therapist = await prisma.person.findFirst({
    where: { id: mainTherapistPermission?.id },
  })

  return {
    id: receipt.id,
    datetime: receipt.datetime,
    name: person?.name,
    email: person?.email,
    address: person?.address,
    taxNumber: person?.tax_number,
    healthNumber: patient?.health_number,
    price: price?.price,
    therapist: therapist?.name,
  }
}
