import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.1 obtaining process info", () => {
  it("(3.1.0 Process Information", async () => {
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
      therapistId: 1,
      ref: "process ref",
      colaborators: ["Marta Santos (Em Estágio)"],
      utent: "Ricardo Maria",
      active: true,
      financialSituation: true,
      speciality: "Familiar",
    }
    const result1 = await request(app)
      .get("/api/process/info?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
    expect(result1.body).toEqual(message)
  })

  it("3.1.1 The user's Verification Token is expired/invalid", async () => {
    const processId = "0"
    const payload = {
      email: "mmenezes@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = result.body.token //set up an intern token

    const result1 = await request(app)
      .get("/api/process/info?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("3.1.2 The user's Verification Token is expired/invalid", async () => {
    const processId = "0"
    const token = "invalid token" //this is the same as having an expired token

    const result = await request(app)
      .get("/api/process/info?processId=" + processId)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
