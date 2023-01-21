import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("5.2 test listing receipts", () => {
  it("5.2.0  list every receipt", async () => {
    const token = "" //set this has valid admin token
    const paid = "true"
    const unPaid = "true"
    const message = {
      message: [
        {
          patientName: "patient0",
          mainTherapist: "Dr João Pedro",
          ref: "string",
          date: "string"
        }
      ]
    }
    
    const result = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("5.2.1  list payed receipts", async () => {
    const token = "" //set this has valid admin token
    const paid = "true"
    const unPaid = "false"
    const message = {
      message: [
        {
          patientName: "patient0",
          mainTherapist: "Dr João Pedro",
          ref: "string",
          date: "string"
        }
      ]
    }
    const result = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("5.2.2  list unpayed receipts", async () => {
    const token = "" //set this has valid admin token
    const paid = "false"
    const unPaid = "true"
    const message = {
      message: []
    }
    const result = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("5.2.3 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const paid = "true"
    const unPaid = "true"
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("5.2.4 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const paid = "true"
    const unPaid = "true"
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .get("/api/receipts/create?paid=" + paid + "&unPaid=" + unPaid)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
