import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../src/main"

describe("Test if auth register endpoint is working", () => {

    it("The user account was created successfully!", async () => {
        const payload = {
            "role": "admin",
            "name": "Sara Brito",
            "email": "sarab@student.dei.uc",
            "password": "password1234",
            "address": "Ferreira Borges, n 10",
            "birthDate": "1988-11-21T0:00:00.000Z",
            "phoneNumber": 919191000
        }
          
        const result = await request(app)
          .post("/api/auth/register")
          .send(payload)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
        expect(result.status).toEqual(StatusCodes.OK)
    })// test auth/register criteria number 0.0

})


