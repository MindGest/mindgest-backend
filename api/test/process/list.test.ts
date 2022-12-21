import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(y+2).0 test getters for listing processes", () => {
  it("(y+2).0.0 test user trying to list processes successfully", async () => {
    const payload = {
      token: "<token>",
    }
    const message = {
      list: {
        therapistListing: ["Marta Santos"],
        patientName: "Ricardo Maria",
        refCode: "23fdfd4e3",
        nextAppointment: "string",
      },
    }
    const result = await request(app)
      .get("/api/process/list")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("(y+2).1.0 test user trying to list processes unsuccessfully", async () => {
    const payload = {
      token: "<token>",
    }
    const message = {
      message: "An internal error has occurred while processing the request",
    }
    const result = await request(app)
      .get("/api/process/list")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(result.body).toEqual(message)
  })

  it("(y+2).2.0 test user trying to get empty process list", async () => {
    const payload = {
      token: "<token>",
    }
    const message = {
      list: {
        therapistListing: [],
        patientName: "",
        refCode: "",
        nextAppointment: "",
      },
    }
    const result = await request(app)
      .get("/api/process/list")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})
