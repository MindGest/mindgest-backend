import prisma from "../../src/utils/prisma"
import argon2 from "argon2"

async function seed() {
  await prisma.person.create({
    data: {
      active: true,
      verified: false,
      approved: false,
      name: "Malaquias",
      email: "malaquias@student.dei.uc.pt",
      password: await argon2.hash("12345"),
      address: "Rua dos Bananas",
      birth_date: new Date("1990-11-21T23:50:28.538Z"),
      phone_number: 9219231942,
      tax_number: 123124123,
    },
  })
}

export default { seed }
