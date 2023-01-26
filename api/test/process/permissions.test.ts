import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.7 test editing user process permissions", () => {
  it("3.7.0 Process Permissions Updated", async () => {
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
    const processId = "0"
    const payload1 = {
      collaboratorId: 0,
      appoint: true,
      statitics: true,
      ditProcess: true,
      editPatient: true,
      archive: true,
      see: true,
    }

    const result1 = await request(app)
      .post("/api/process/permissions?processId=" + processId)
      .send(payload1)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("(3.7.1 test edit user process permission successfully", async () => {
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

    const processId = "0"
    const payload1 = {
      token: "<therapist_auth_token>",
      processId: "<ref_code_not_in_list>",
      collaboratorId: 0,
      appoint: true,
      statitics: true,
      ditProcess: true,
      editPatient: true,
      archive: true,
      see: true,
    }

    const result1 = await request(app)
      .post("/api/process/permissions?processId=" + processId)
      .send(payload1)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("3.7.2 test edit user process permission with expired token", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const processId = "0"
    const payload = {
      collaboratorId: 0,
      appoint: true,
      statitics: true,
      ditProcess: true,
      editPatient: true,
      archive: true,
      see: true,
    }

    const result = await request(app)
      .post("/api/process/permissions?processId=" + processId)
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
