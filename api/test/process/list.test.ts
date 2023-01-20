import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.2 test getters for listing processes", () => {
  it("3.2.0 test user trying to list processes successfully", async () => {
    const token = "" //set up a valid admin token
    const message = {
      list: {
        therapistListing: ["Marta Santos"],
        patientName: "Ricardo Maria",
        refCode: "23fdfd4e3",
        nextAppointment: "string",
      },
    }
    const result = await request(app)
      .get("/api/process/list?active=true&especiality=Esp-A")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("3.2.1 test user trying to get empty process list", async () => {
    const token = "Invalid token" //this is the same as having an expired token
    const message = {
      "message": "Verification token invalid or expired"
    }
    const result = await request(app)
      .get("/api/process/list?active=true&speciality=Esp-A")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
