import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.0 Test admin registration", () => {
  it("0.0.0 test - Validate admin register", async () => {
    const payload = {
      role: "admin",
      name: "Sara Brito",
      email: "sarab@student.dei.uc",
      password: "password1234",
      address: "Ferreira Borges, n 10",
      birthDate: "1988-11-21T0:00:00.000Z",
      phoneNumber: 919191000,
    }

    // in json format
    const message = {
      message: "The user account was created successfully!",
    }

    const result = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})

describe("0.1 Test therapist registration", () => {
  it("0.1.0 test - Validate therapist register", async () => {
    const payload = {
      role: "therapist",
      name: "John Doe",
      email: "johndoe@student.dei.uc",
      password: "password1234",
      address: "Wall Streed",
      birthDate: "1990-11-21T23:50:28.538Z",
      phoneNumber: 9219231942,
      healthSystem: "adse",
      license: "51382",
      taxNumber: 283192189,
    }

    // in json format
    const message = {
      message: "The user account was created successfully!",
    }

    const result = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})

describe("0.2 Test security personnel registration", () => {
  it("0.2.0 test - Validate security register", async () => {
    const payload = {
      role: "guard",
      name: "Pedro Oblíquo",
      email: "obliquo@student.dei.uc",
      password: "password1234",
      address: "Rua paralela",
      birthDate: "1964-04-12T00:00:00.000Z",
      phoneNumber: 963918402,
      taxNumber: 193619773,
    }

    // in json format
    const message = {
      message: "The user account was created successfully!",
    }

    const result = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})

describe("0.3 Test accountant registration", () => {
  it("0.3.0 test - Validate accountant register", async () => {
    const payload = {
      role: "accountant",
      name: "Carolina Damásio",
      email: "caroldam@student.dei.uc",
      password: "password1234",
      address: "Rua do pessegueiro",
      birthDate: "1992-10-04T00:00:00.000Z",
      phoneNumber: 969951849,
      taxNumber: 191770341,
    }

    // in json format
    const message = {
      message: "The user account was created successfully!",
    }

    const result = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})

describe("0.4 Test intern registration", () => {
  it("0.4.0 test - Validate intern register", async () => {
    const payload = {
      role: "intern",
      name: "Maria Menezes",
      email: "mmenezes@student.dei.uc",
      password: "password1234",
      address: "Rua do Brigadeiro Cardoso, n 369",
      birthDate: "2000-4-13T00:00:00.000Z",
      phoneNumber: 919193948,
    }

    const message = {
      message: "The user account was created successfully!",
    }

    const result = await request(app)
      .post("/api/auth/register")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("0.4.1 Test if the above user was criated", async() => {
    //falta info sobre o endpoint
})

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
        "email": "mmenezes@student.dei.uc.pt",
        "password": "different_password"
      }
  
      const message = {
        "message": "Login. Invalid credentials"
      }
      
      const result = await request(app)
        .post("/api/auth/login")
        .send(payload)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
      expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
      expect(result.body).toEqual(message)
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