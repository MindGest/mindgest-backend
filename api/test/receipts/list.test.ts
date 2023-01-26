import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("5.2 test listing receipts", () => {
  it("5.2.0  list every receipt", async () => {
    
    const payload1 = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has valid admin token
    
    const paid = "true"
    const unPaid = "true"
    
    const message = {
      message: [
        {
          patientName: "patient0",
          mainTherapist: "Dr João Pedro",
          ref: "string",
          date: "string",
        },
      ],
    }

    const result2 = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
    expect(result2.body).toEqual(message)
  })

  it("5.2.1  list payed receipts", async () => {
    
    const payload1 = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has valid admin token
    
    const paid = "true"
    const unPaid = "false"
    
    const message = {
      message: [
        {
          patientName: "patient0",
          mainTherapist: "Dr João Pedro",
          ref: "string",
          date: "string",
        },
      ],
    }

    const result2 = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
    expect(result2.body).toEqual(message)
  })

  it("5.2.2  list unpayed receipts", async () => {
    
    const payload1 = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has valid admin token
    
    const paid = "false"
    const unPaid = "true"
    
    const message = {
      message: [],
    }

    const result2 = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.OK)
    expect(result2.body).toEqual(message)
  })

  it("5.2.3 User doesn't have authorization", async () => {
    
    const payload1 = {
      email: "obliquo@student.dei.uc.pt",
      password: "password1234",
    }
    const result1 = await request(app)
      .post("/api/auth/login")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    const token = result1.body.token //set this has guard token
    
    const paid = "true"
    const unPaid = "true"
    
    const result2 = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result2.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("5.2.4 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const paid = "true"
    const unPaid = "true"
    
    const result = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
