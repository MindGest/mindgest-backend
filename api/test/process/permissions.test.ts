import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.7 test editing user process permissions", () => {
  it("3.7.0 Process Permissions Updated", async () => {
    const token = "" //set this is has valid admin token
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
    const message = {
      message: "Permission updated",
    }
    const result = await request(app)
      .post("/api/process/permissions?processId=" + processId)
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("(3.7.1 test edit user process permission successfully", async () => {
    const token = "" //set this is has guard token
    const processId = "0"
    const payload = {
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
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/process/permissions?processId=" + processId)
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
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
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/process/permissions?processId=" + processId)
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
