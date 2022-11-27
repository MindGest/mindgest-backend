import { Request, Response } from "express"

// checks if a user can edit or not
// if he is the user himself, then can, otherwise only can if he is an admin or one of the patients therapist

// type: patient -> admin, intern (with permissions?), therapist on the process

export async function createPatient(req: Request, res: Response) {}

export async function editPatient(req: Request, res: Response) {}

export async function getPatients(req: Request, res: Response) {}

export default { createPatient, editPatient, getPatients }
