import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("(y+7).0 ativar um processo", () => {
  it("(y+7).0.0 ativar um processo já existente", async () => {
    const payload = {
      token: "auth_token",
      processId: "<refCode>",
    } //é preciso gerar o token e definir um process id

    const message = {
      message: "Process Activated",
    }

    const result = await request(app)
      .post("/api/proccess/activate")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})

describe("(y+7).1 User that has no permission to alter process tries to", () => {
  it("(y+7).1.0 fails to alter process", async () => {
    const payload = {
      token: "auth_token",
      processId: "<refCode>",
    } //é preciso gerar o token de uma pessoa sem autorização e definir um process id
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/process/activate")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })
})

describe("(y+7).2 invalid token for ", () => {
  it("(y+7).2.0 user is not in the database so it cannot recover password", async () => {
    const payload = {
      token: "invalid token",
      processId: "<refCode>",
    } //é preciso definir um process id

    const message = {
      message: "Verification token invalid or expired",
    }

    const result = await request(app)
      .post("/api/process/activate")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
