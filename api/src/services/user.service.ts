import prisma from "../utils/prisma"

// If it is a bug (or bad implementation) that you rely on.
// It's not a bug. It's a feature.
export async function fetchPersonProperties(personId: bigint) {
  let therapist = await prisma.therapist.findUnique({
    where: { person_id: personId },
  })
  if (therapist) return { /*isAdmin: therapist.admin,*/ userRole: "therapist" }

  let intern = await prisma.intern.findUnique({
    where: { person_id: personId },
  })
  if (intern) return { isAdmin: false, userRole: "intern" }

  let guard = await prisma.guard.findUnique({
    where: { person_id: personId },
  })
  if (guard) return { isAdmin: false, userRole: "guard" }

  let accountant = await prisma.accountant.findUnique({
    where: { person_id: personId },
  })
  if (accountant) return { isAdmin: false, userRole: "accountant" }

  return { isAdmin: true, userRole: "therapist" }
}
