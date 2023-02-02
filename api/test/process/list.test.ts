import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.2 test getters for listing processes", () => {
  it("3.2.0 test user trying to list processes successfully", async () => {
    const processId = "0"
    const payload = {
      email: "sarab@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an admin token
    const message = {
      list: [
        {
          therapistListing: ["Marta Santos"],
          patientName: "Ricardo Maria",
          refCode: "23fdfd4e3",
          nextAppointment: "string",
        },
      ],
    }
    const result1 = await request(app)
      .get("/api/process/list?active=true&especiality=Esp-A")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
    expect(result1.body).toEqual(message)
  })

  it("3.2.2 test user trying to get empty process list", async () => {
    const processId = "0"
    const payload = {
      email: "obliquo@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an guard token

    const result1 = await request(app)
      .get("/api/process/list?active=true&speciality=Esp-A")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("3.2.2 test user trying to get empty process list", async () => {
    const token = "Invalid token" //this is the same as having an expired token

    const result = await request(app)
      .get("/api/process/list?active=true&speciality=Esp-A")
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
