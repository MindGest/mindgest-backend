import prisma from "../utils/prisma"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { GetPatientTypeBody, GetPatientInfoBody, CreateChildPatientBody } from "../utils/types"

var CHILD_PATIENT = 'child';
var TEEN_PATIENT = 'teen';
var ADULT_PATIENT = 'adult';
var ELDER_PATIENT = 'elder';
var FAMILY_PATIENT = 'family';
var COUPLE_PATIENT = 'couple';
var DUMMY_PASSWORD = "ImDummyDaBaDeeDaBaDi";


export async function create(req: Request, res: Response) {
  console.log("Coming Soon")
}
export async function list(req: Request, res: Response) {
  let decode = res.locals.token
  let id = decode.id

  let therapistProcesses = await prisma.therapist_process.findMany({
    where: {
      therapist_person_id: id,
    },
  })

  let usersInfo = []
  for (let processInfo of therapistProcesses) {
    let usersProcess = await prisma.patient_process.findMany({
      where: {
        process_id: processInfo.process_id,
      },
    })

    for (let user of usersProcess) {
      let userInfo = await prisma.person.findUnique({
        where: {
          id: user.patient_person_id,
        },
      })

      let userMoreInfo = await prisma.patient.findUnique({
        where: {
          person_id: user.patient_person_id,
        },
      })

      let responsable = await prisma.liable.findFirst({
        where: {},
      })
    }
  }
}

// listar todos os pacientes (nome e tipo talvez idk, preciso para a criação do processo)
export async function listPatients(req: Request, res: Response){
  /**
  * if admin, return all
  * if therapist or intern, return the associated patients
  * as said in the mockups, it does not matter the permissions of the intern
  */
  try{
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // check authorization for this endpoint
    if (callerRole == 'accountant' || callerRole == 'guard'){
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information."
      })
    }

    // get the processes (the part that is different for the various allowed users in this endpoint)
    let processes = [];
    if (callerRole == 'admin'){
      processes = await prisma.process.findMany();
    }
    // código repetido, mas já não quero saber ahhaha
    else if (callerRole == 'therapist'){
      let therapist_process = await prisma.therapist_process.findMany({where: {therapist_person_id: callerId}});
      for (let i = 0; i < therapist_process.length; i++){
        processes.push(await prisma.process.findFirst({where: {id: therapist_process[i].process_id}}));
      }
    }
    else if (callerRole == 'intern'){
      let intern_process = await prisma.intern_process.findMany({where: {intern_person_id: callerId}});
      for (let i = 0; i < intern_process.length; i++){
        processes.push(await prisma.process.findFirst({where: {id: intern_process[i].process_id}}));
      }
    }

    // for each process
    let infoToReturn = [];
    for (let i = 0; i < processes.length; i++){
      // get the main therapist name
      let permission = await prisma.permissions.findFirst({where: {process_id: processes[i]?.id, isMain: true}})
      let mainTherapist = await prisma.person.findFirst({where: {id: permission?.person_id}, select: {name: true}});
      // get the patient names
      let patient_process = await prisma.patient_process.findMany({where: {process_id: processes[i]?.id}});
      let patientNames = [];
      for (let e = 0; e < patientNames.length; e++){
        let patient = await prisma.person.findFirst({where: {id: patient_process[e].patient_person_id}, select: {name: true}});
        patientNames.push(patient?.name);
      }
      // assemble the json of this process
      infoToReturn.push({
        mainTherapistName: mainTherapist?.name,
        patientNames: patientNames,
        processRefCode: processes[i]?.ref,
        processId: processes[i]?.id,
      })
    }

    res.status(StatusCodes.OK).json({
      data: infoToReturn
    })

  }
  catch (error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// retornar info de um paciente dado o seu id.
export async function getPatientInfo(req: Request<{}, {}, GetPatientInfoBody>, res: Response){
  /**
  * return the information of the patient associated with the given id.
  * The specific process must be specified, given that care takers are associated with the process and not the patient.
  */
  try{
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    let isAnAuthorizedIntern = false;
    let patientId = req.body.patientId;
    let processId = req.body.processId;

    // if intern, verify if he is in a process with this patient
    if (callerRole == 'intern'){
      // get the processes with this patient
      let intern_process = await prisma.intern_process.findMany({where: {intern_person_id: callerId}})

      // verify if the intern is associated with any of them
      for (let i = 0; i < intern_process.length; i++){
        let patient_process = await prisma.patient_process.findFirst({where: {process_id: intern_process[i].process_id, patient_person_id: patientId}});
        // if associated, check intern permissions (see permission)
        if (patient_process != null){
          let permission = await prisma.permissions.findFirst({where: {process_id: patient_process.process_id, person_id: callerId}});
          if (permission != null && permission.see){ // if he has see permission, allow him to get this info
            isAnAuthorizedIntern = true;
          }
        }
      }
    }

    // if admin, therapist, or an authorized intern, let them retrieve this information
    if (!callerIsAdmin && !isAnAuthorizedIntern && callerRole != 'therapist'){
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information."
      })
    }

    // get the type of patient, because the info  of each type may differ.
    let patientTypeName = await privateGetPatientType(patientId);
    let data = null;

    if (patientTypeName == CHILD_PATIENT || patientTypeName == TEEN_PATIENT){
      data = await buildInfoChildOrTeenPatient(patientId, processId, patientTypeName);
    }
    else if (patientTypeName == ELDER_PATIENT || patientTypeName == ADULT_PATIENT){
      data = await buildInfoAdultOrElderPatient(patientId, processId, patientTypeName)
    }
    else if (patientTypeName == COUPLE_PATIENT || patientTypeName == FAMILY_PATIENT){
      data = buildInfoCoupleOrFamilyPatient(patientId, processId, patientTypeName);
    }

    res.status(StatusCodes.OK).json({
      data: data,
    })

  }
  catch (error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// criar pacientes (crianca)
export async function createChildPatient(req: Request<{}, {}, CreateChildPatientBody>, res: Response){
  try{
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // create the person
    let person = await prisma.person.create({
      data: {
        password: DUMMY_PASSWORD, // TODO: os patients não têm password, o que colocar?
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        birth_date: req.body.birthDate,
        photo: req.body.photo,
        phone_number: req.body.phoneNumber,
        verified: true, // não sei se há forma de aprovar TODO: mudar depois
        active: true,
        approved: true, // não sei se há forma de aprovar TODO: mudar depois
        tax_number: req.body.taxNumber,
      }
    })
    // create the patient
    let patient = await prisma.patient.create({
      data: {
        person_id: person.id,
        health_number: req.body.healthNumber,
        request: req.body.request,
        remarks: req.body.remarks,
        patienttype_id: req.body.patientTypeId,
      }
    })

    // create the school
    await prisma.school.create({
      data: {
        grade: req.body.grade,
        name: req.body.school,
        course: "",
        patient_person_id: patient.person_id,
      }
    })

    // create the care takers.

    res.status(StatusCodes.OK).json({
      message: "patient created successfully."
    })

  }
  catch (error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// criar paciente (jovem)

// criar paciente (adulto)

// criar paciente (idoso)

// criar paciente (casal)

// criar paciente (familia)

// retornar o tipo de um paciente (pode dar jeito)
export async function getPatientType(req: Request<{}, {}, GetPatientTypeBody>, res: Response){
  try{
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    let isAnAuthorizedIntern = false;
    let patientId = req.body.patientId;

    // if intern, verify if he is in a process with this patient
    if (callerRole == 'intern'){
      // get the processes with this patient
      let intern_process = await prisma.intern_process.findMany({where: {intern_person_id: callerId}})

      // verify if the intern is associated with any of them
      for (let i = 0; i < intern_process.length; i++){
        let patient_process = await prisma.patient_process.findFirst({where: {process_id: intern_process[i].process_id, patient_person_id: patientId}});
        // if associated, check intern permissions (see permission)
        if (patient_process != null){
          let permission = await prisma.permissions.findFirst({where: {process_id: patient_process.process_id, person_id: callerId}});
          if (permission != null && permission.see){ // if he has see permission, allow him to get this info
            isAnAuthorizedIntern = true;
          }
        }
      }
    }

    // if admin, therapist, or an authorized intern, let them retrieve this information
    if (!callerIsAdmin && !isAnAuthorizedIntern && callerRole != 'therapist'){
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You are not allowed to access this information."
      })
    }
    
    let patientTypeName = await privateGetPatientType(patientId);
    
    res.status(StatusCodes.OK).json({
      data: {
        patientTypeName: patientTypeName,
      }
    })
  }
  catch (error){
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

async function privateGetPatientType(patientId: number){
  // get some of the patient info
  let patient = await prisma.patient.findFirst({where: {person_id: patientId}});

  // get the patientType name
  let patientType = await prisma.patienttype.findFirst({where: {id: patient?.patienttype_id}});

  return patientType?.type;
}

async function buildInfoChildOrTeenPatient(patientId: number, processId: number, patientTypeName: string){
  /**
   * build a json with the information of the teen or child patient of the given id.
   */

  let person = await prisma.person.findFirst({where: {id: patientId}});

  let patient = await prisma.patient.findFirst({where: {person_id: patientId}});

  let school = await prisma.school.findFirst({where: {patient_person_id: patientId}});

  // obtain information about the care takers
  let careTakers = await prisma.process_liable.findMany({where: {process_id: processId}});

  // for each care taker
  let careTakersInfo = [];
  for (let i = 0; i < careTakers.length; i++){
    let careTaker = await prisma.liable.findFirst({where: {id: careTakers[i].liable_id}});
    careTakersInfo.push({
      name: careTaker?.name,
      email: careTaker?.email,
      phoneNumber: careTaker?.phonenumber,
      type: careTaker?.type,
      remarks: careTaker?.remarks,
    })
  }

  let patientInfo = null;
  if (patientTypeName == TEEN_PATIENT){
    patientInfo = {
      name: person?.name,
      email: person?.email,
      address: person?.address,
      birthDate: person?.birth_date,
      photo: person?.photo,
      phoneNumber: person?.phone_number,
      verified: person?.verified,
      active: person?.active,
      approved: person?.approved,
      taxNumber: person?.tax_number,
      healthNumber: patient?.health_number,
      request: patient?.request,
      remarks: patient?.remarks,
      patientTypeName: patientTypeName,
      grade: school?.grade,
      school: school?.name,
      course: school?.course,
      careTakers: careTakersInfo,
    };
  } else if (patientTypeName == CHILD_PATIENT){
    patientInfo = {
      name: person?.name,
      email: person?.email,
      address: person?.address,
      birthDate: person?.birth_date,
      photo: person?.photo,
      phoneNumber: person?.phone_number,
      verified: person?.verified,
      active: person?.active,
      approved: person?.approved,
      taxNumber: person?.tax_number,
      healthNumber: patient?.health_number,
      request: patient?.request,
      remarks: patient?.remarks,
      patientTypeName: patientTypeName,
      grade: school?.grade,
      school: school?.name,
      careTakers: careTakersInfo,
    };
  }

  return patientInfo;
}

async function buildInfoAdultOrElderPatient(patientId: number, processId: number, patientTypeName: string){
  /**
   * build a json with the information of the adult or elder patient of the given id.
   */

  let person = await prisma.person.findFirst({where: {id: patientId}});

  let patient = await prisma.patient.findFirst({where: {person_id: patientId}});

  let profession = await prisma.profession.findFirst({where: {patient_person_id: patientId}});

  // obtain information about the care takers
  let careTakers = await prisma.process_liable.findMany({where: {process_id: processId}});

  // for each care taker
  let careTakersInfo = [];
  for (let i = 0; i < careTakers.length; i++){
    let careTaker = await prisma.liable.findFirst({where: {id: careTakers[i].liable_id}});
    careTakersInfo.push({
      name: careTaker?.name,
      email: careTaker?.email,
      phoneNumber: careTaker?.phonenumber,
      type: careTaker?.type,
      remarks: careTaker?.remarks,
    })
  }

  let patientInfo = {
    name: person?.name,
    email: person?.email,
    address: person?.address,
    birthDate: person?.birth_date,
    photo: person?.photo,
    phoneNumber: person?.phone_number,
    verified: person?.verified,
    active: person?.active,
    approved: person?.approved,
    taxNumber: person?.tax_number,
    healthNumber: patient?.health_number,
    request: patient?.request,
    remarks: patient?.remarks,
    patientTypeName: patientTypeName,
    profession: profession?.name,
    careTakers: careTakersInfo,
  };

  return patientInfo;
}

async function buildInfoCoupleOrFamilyPatient(patientId: number, processId: number, patientTypeName: string){
  /**
   * build a json with the information of the couple or family patient (all members) of the given processId.
   */

  let membersInfo = [];
  // get the ids of the members (through the process)
  let members = await prisma.patient_process.findMany({where: {process_id: processId}});
  for (let i = 0; i < members.length; i++){
    let person = await prisma.person.findFirst({where: {id: members[i].patient_person_id}});

    let patient = await prisma.patient.findFirst({where: {person_id: members[i].patient_person_id}});
  
    let profession = await prisma.profession.findFirst({where: {patient_person_id: members[i].patient_person_id}});
    
    let patientInfo = {
      name: person?.name,
      email: person?.email,
      address: person?.address,
      birthDate: person?.birth_date,
      photo: person?.photo,
      phoneNumber: person?.phone_number,
      verified: person?.verified,
      active: person?.active,
      approved: person?.approved,
      taxNumber: person?.tax_number,
      healthNumber: patient?.health_number,
      request: patient?.request,
      remarks: patient?.remarks,
      patientTypeName: patientTypeName,
      profession: profession?.name,
    };

    membersInfo.push(patientInfo);
  }

  return membersInfo;
}

/**
 *                                          Table "public.school"
      Column       |          Type          | Collation | Nullable |              Default               
-------------------+------------------------+-----------+----------+------------------------------------
 id                | bigint                 |           | not null | nextval('school_id_seq'::regclass)
 name              | bigint                 |           | not null | 
 course            | character varying(512) |           | not null | 
 grade             | bigint                 |           |          | 
 patient_person_id 

                           Table "public.profession"
      Column       |          Type          | Collation | Nullable | Default 
-------------------+------------------------+-----------+----------+---------
 id                | bigint                 |           | not null | 
 name              | character varying(512) |           | not null | 
 patient_person_id | bigint

                           Table "public.patient"
     Column     |          Type          | Collation | Nullable | Default 
----------------+------------------------+-----------+----------+---------
 health_number  | bigint                 |           | not null | 
 request        | character varying(512) |           | not null | 
 remarks        | character varying(512) |           |          | 
 patienttype_id | bigint                 |           | not null | 
 person_id      |

                                        Table "public.person"
    Column    |          Type          | Collation | Nullable |              Default               
--------------+------------------------+-----------+----------+------------------------------------
 id           | bigint                 |           | not null | nextval('person_id_seq'::regclass)
 name         | character varying(512) |           | not null | 
 email        | character varying(512) |           | not null | 
 password     | character varying(512) |           | not null | 
 address      | character varying(512) |           | not null | 
 birth_date   | date                   |           | not null | 
 photo        | character varying(512) |           |          | 
 phone_number | bigint                 |           | not null | 
 verified     | boolean                |           | not null | 
 active       | boolean                |           | not null | 
 approved     | boolean                |           | not null | 
 tax_number   |

                                       Table "public.liable"
   Column    |          Type          | Collation | Nullable |              Default               
-------------+------------------------+-----------+----------+------------------------------------
 id          | bigint                 |           | not null | nextval('liable_id_seq'::regclass)
 name        | character varying(512) |           | not null | 
 email       | character varying(512) |           | not null | 
 phonenumber | bigint                 |           | not null | 
 type        | character varying(512) |           | not null | 
 remarks     |
 */


export default { create, list }
