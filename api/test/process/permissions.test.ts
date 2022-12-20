import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"


describe("(y+6).0 test editing user process permissions", () => {

  it("(y+6).0.0 test edit user process permission successfully", async () => {
    const payload = {
        token: "<therapist_auth_token>",
        processId: 0,
        collaboratorId: 0,
        appoint: true,
        statitics: true,
        ditProcess: true,
        editPatient: true,
        archive: true,
        see: true
    }
    const message = {
        message: "Permission updated"
    }
    const result = await request(app)
      .post("/api/process/permissions")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })


  it("(y+6).1.0 test edit user process permission successfully", async () => {
    const payload = {
        token: "<therapist_auth_token>",
        processId: "<ref_code_not_in_list>",
        collaboratorId: 0,
        appoint: true,
        statitics: true,
        ditProcess: true,
        editPatient: true,
        archive: true,
        see: true
    }
    const message = {
        message: "Permission updated"
    }
    const result = await request(app)
      .post("/api/process/permissions")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

})
