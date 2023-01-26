import request from "supertest"

import { StatusCodes } from "http-status-codes"
import { describe, it } from "@jest/globals"

import app from "../../src/main"

describe("0.0 Test registration", () => {
  it("0.0.0 test - Validate admin register", async () => {
    const payload = {
      name: "Sara Brito",
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
      address: "Ferreira Borges, Nº10",
      birthDate: "1988-11-21T00:00:00.000Z",
      phoneNumber: 919191000,
      taxNumber: 238218312,
      role: "admin",
    }

    await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.CREATED)
  })

  it("0.0.1 test - Repeat registration", async () => {
    const payload = {
      name: "Sara Brito",
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
      address: "Ferreira Borges, Nº10",
      birthDate: "1988-11-21T00:00:00.000Z",
      phoneNumber: 919191000,
      taxNumber: 238218312,
      role: "admin",
    }

    await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.CONFLICT)
  })

  it("0.0.2 test - Validate therapist register", async () => {
    const payload = {
      role: "therapist",
      name: "John Doe",
      email: "johndoe@student.dei.uc.pt",
      password: "password1234",
      address: "Wall Street",
      birthDate: "1990-11-21T23:50:28.538Z",
      phoneNumber: 9219231942,
      healthSystem: "ADSE",
      license: "51382",
      taxNumber: 283192189,
    }

    await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.CREATED)
  })
  it("0.0.3 test - Validate security register", async () => {
    const payload = {
      role: "guard",
      name: "Pedro Oblíquo",
      email: "obliquo@student.dei.uc.pt",
      password: "password1234",
      address: "Rua paralela",
      birthDate: "1964-04-12T00:00:00.000Z",
      phoneNumber: 963918402,
      taxNumber: 193619773,
    }

    await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.CREATED)
  })

  it("0.0.4 test - Validate accountant register", async () => {
    const payload = {
      role: "accountant",
      name: "Carolina Damásio",
      email: "caroldam@student.dei.uc.pt",
      password: "password1234",
      address: "Rua do pessegueiro",
      birthDate: "1992-10-04T00:00:00.000Z",
      phoneNumber: 969951849,
      taxNumber: 191770341,
    }
    await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.CREATED)
  })

  it("0.0.5 test - Validate intern register", async () => {
    const payload = {
      role: "intern",
      name: "Maria Menezes",
      email: "mmenezes@student.dei.uc.pt",
      password: "password1234",
      address: "Rua do Brigadeiro Cardoso, n 369",
      birthDate: "2000-04-13T00:00:00.000Z",
      phoneNumber: 919193948,
    }

    await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.CREATED)
  })
})
