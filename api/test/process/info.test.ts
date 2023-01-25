import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.1 obtaining process info", () => {
  it("(3.1.0 Process Information", async () => {
    const processId = "0"
    const token = "" //set up a valid admin token
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
      .get("/api/process/info?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("3.1.1 The user's Verification Token is expired/invalid", async () => {
    const processId = "0"
    const token = "invalid token" //this is the same as having an expired token
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/process/info?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
