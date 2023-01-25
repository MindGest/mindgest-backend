import request from "supertest"

import { StatusCodes } from "http-status-codes"
import { describe, it } from "@jest/globals"

import app from "../../src/main"

describe("0.0 Test admin registration", () => {
  it("0.0.0 Test - Validate admin register", async () => {
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
})

describe("0.1 Test therapist registration", () => {
  it("0.1.0 Test - Validate therapist register", async () => {
    const payload = {
      role: "therapist",
      name: "John Doe",
      email: "johndoe@student.dei.uc.pt",
      password: "password1234",
      address: "Wall Street",
      birthDate: "1990-11-21T00:00:00.000Z",
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
})

describe("0.2 Test security personnel registration", () => {
  it("0.2.0 Test - Validate security register", async () => {
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
})

describe("0.3 Test accountant registration", () => {
  it("0.3.0 Test - Validate accountant register", async () => {
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
})

describe("0.4 Test intern registration", () => {
  it("0.4.0 Test - Validate intern register", async () => {
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

  // it("0.4.1 Test if the above user was criated", async () => {
  //   //falta info sobre o endpoint
  // })

  /* missing output
    it("0.4.2 Test duplicate email in registration", async () => {
        const payload = {
            "role": "intern",
            "name": "Mário Menezes",
            "email": "mmenezes@student.dei.uc",
            "password": "password1234",
            "address": "Rua do Brigadeiro Cardoso, n 370",
            "birthDate": "1984-4-13T00:00:00.000Z",
            "phoneNumber": 919193948
        }

        // in json format
        const message = {
            message: ""
        }

        const result = await request(app)
          .post("/api/auth/register")
          .send(payload)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
        expect(result.status).toEqual(StatusCodes.OK)
        expect(result.body).toEqual(message)
    })*/

  it("0.4.3 test - Test if the above above test didn't alter user info", async () => {
    const payload = {
      email: "mmenezes@student.dei.uc.pt",
      password: "different_password",
    }

    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(StatusCodes.UNAUTHORIZED)
  })
})

/* missing output
    it("0.11 test - Wrong mail", async () => {
        const payload = {
            "role": "therapist",
            "name": "Ana Sofia",
            "email": "anasofia@gmail.com",
            "password": "password1234",
            "address": "Rua flores",
            "birthDate": "1990-11-21T00:00:00.000Z",
            "phoneNumber": 929231943
        }

        const message = {
            message: ""
        }

        const result = await request(app)
          .post("/api/auth/register")
          .send(payload)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
        expect(result.status).toEqual(StatusCodes.OK)
        expect(result.body).toEqual(message)
    })*/
