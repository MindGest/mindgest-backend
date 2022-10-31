import { accountant, guard, intern, patient, person, PrismaClient, therapist } from "@prisma/client";

export async function createTokenUser(person:person){
    //VERSAO INICIAL NSEI SE ISTO TA BEM OU N
    const prisma = new PrismaClient()

    const isAccountant: accountant | null = await prisma.accountant.findUnique({
        where: {
            person_id: person.id,
        },
    })

    const isPatient: patient | null = await prisma.patient.findUnique({
        where: {
            person_id: person.id,
        },
    })

    const isIntern: intern | null = await prisma.intern.findUnique({
        where: {
            person_id: person.id,
        },
    })

    const isGuard: guard | null = await prisma.guard.findUnique({
        where: {
            person_id: person.id,
        },
    })

    const isTherapist: therapist | null = await prisma.therapist.findUnique({
        where: {
            person_id: person.id,
        },
    })
    
    if(isTherapist != null){
        if(isTherapist.admin == true){
            return { name: person.name, userId: person.id, role: "therapist", admin: true };
        }
        else{
            return { name: person.name, userId: person.id, role: "therapist", admin: false };
        }
    }
    else if(isGuard != null){
        return { name: person.name, userId: person.id, role: "guard", admin: false };
    }
    else if(isAccountant != null){
        return { name: person.name, userId: person.id, role: "accountant", admin: false };
    }
    else if(isIntern != null){
        return { name: person.name, userId: person.id, role: "intern", admin: false };
    }else{
        return { name: person.name, userId: person.id, role: "patient", admin: false };
    }
  };