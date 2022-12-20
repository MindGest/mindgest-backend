import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(y+1).0 test getters of process informations", () => {
  it("(y+1).0.0 test user trying to get information successfully", async () => {
    const payload = {
      token: "<token>",
      processId: 0,
    }
    const message = {
      therapistId: 1,
      ref: "process ref",
      colaborators: ["Marta Santos (Em Estágio)"],
      utent: "Ricardo Maria",
      active: true,
      financialSituation: true,
      speciality: "Familiar",
    }
    const result = await request(app)
      .get("/api/process/info")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("(y+1).1.0 test user trying to get information without authoriztion", async () => {
    const payload = {
      token: "<token>",
      processId: 0,
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/process/info")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("(y+1).2.0 test user trying to get information of unexisting process", async () => {
    const payload = {
      token: "<token>",
      processId: null,
    }
    const message = {
      message: "An internal error has occurred while processing the request",
    }
    const result = await request(app)
      .get("/api/process/info")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
    expect(result.body).toEqual(message)
  })
})
