import z from "zod"

export const DateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg)
}, z.date())

export const PersonSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  address: z.string(),
  birthDate: DateSchema,
  phoneNumber: z.number(),
})

export const TherapistSchema = z
  .object({
    healthSystem: z.string().optional(),
    license: z.string(),
  })
  .merge(PersonSchema)
  .merge(z.object({ taxNumber: z.number() }))

export const AdminSchema = PersonSchema.merge(z.object({ taxNumber: z.number() }))
export const GuardSchema = PersonSchema.merge(z.object({ taxNumber: z.number() }))
export const AccountantSchema = PersonSchema.merge(z.object({ taxNumber: z.number() }))
export const InternSchema = PersonSchema

export const RegistrationSchema = z.object({
  body: z.discriminatedUnion("role", [
    AdminSchema.merge(
      z.object({
        role: z.literal("admin"),
      })
    ).strict(),
    GuardSchema.merge(
      z.object({
        role: z.literal("guard"),
      })
    ).strict(),
    TherapistSchema.merge(
      z.object({
        role: z.literal("therapist"),
      })
    ).strict(),
    InternSchema.merge(
      z.object({
        role: z.literal("intern"),
      })
    ).strict(),
    AccountantSchema.merge(
      z.object({
        role: z.literal("accountant"),
      })
    ).strict(),
  ]),
})

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
})

export const RefreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .strict()
    .required(),
})

export const AuthToken = z.object({
  body: z
    .object({
      refreshToken: z.string().optional(),
    })
    .strict()
    .required(),
})

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    callback: z.string().url().optional(),
  }),
})

export const AccountVerificationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    callback: z.string().url().optional(),
  }),
})

export const ResetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string(),
      password: z.string({
        required_error: "Password is required",
      }),
      confirm: z.string({
        required_error: "Password confirmation is required",
      }),
    })
    .strict()
    .refine((data) => data.password === data.confirm, {
      message: "Passwords should match",
    }),
})

export const VerifyAccountSchema = z.object({
  body: z
    .object({
      token: z.string(),
    })
    .strict()
    .required(),
})

export const PersonUpdateSchema = z
  .object({
    active: z.boolean(),
    approved: z.boolean(),
  })
  .merge(PersonSchema)

export const TherapistUpdateSchema = z
  .object({
    healthSystem: z.string().optional(),
    license: z.string(),
    extern: z.boolean(),
    taxNumber: z.object({ taxNumber: z.number() }),
  })
  .merge(PersonUpdateSchema)

export const AdminUpdateSchema = PersonUpdateSchema.merge(z.object({ taxNumber: z.number() }))
export const GuardUpdateSchema = PersonUpdateSchema.merge(z.object({ taxNumber: z.number() }))
export const AccountantUpdateSchema = PersonUpdateSchema.merge(z.object({ taxNumber: z.number() }))
export const InternUpdateSchema = PersonUpdateSchema

export const PatientSchema = z
  .object({
    tax_number: z.number(),
    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patienttype_id: z.number(),

    // school parameters (can be optional)
    schoolName: z.string().optional(),
    schoolCourse: z.string().optional(),
    schoolGrade: z.string().optional(),

    // profession parameters (can be optional)
    professionName: z.string().optional(),
  })
  .merge(PersonUpdateSchema)

export const EditProfileSchema = z.object({
  body: z.union([
    AdminUpdateSchema.strict(),
    GuardUpdateSchema.strict(),
    TherapistUpdateSchema.strict(),
    InternUpdateSchema.strict(),
    AccountantUpdateSchema.strict(),
  ]),
})

// it has the token of the user that called the method (token) and the info of the user that is going to be updated
export const EditUserSchema = z.object({
  body: z.object({
    token: z.string(),
    id: z.number(), // o id do user que se vai atualizar
    userToEdit: z.discriminatedUnion("role", [
      AdminUpdateSchema.merge(
        z.object({
          role: z.literal("admin"),
        })
      ).strict(),
      GuardUpdateSchema.merge(
        z.object({
          role: z.literal("guard"),
        })
      ).strict(),
      TherapistUpdateSchema.merge(
        z.object({
          role: z.literal("therapist"),
        })
      ).strict(),
      InternUpdateSchema.merge(
        z.object({
          role: z.literal("intern"),
        })
      ).strict(),
      AccountantUpdateSchema.merge(
        z.object({
          role: z.literal("accountant"),
        })
      ).strict(),
      PatientSchema.merge(
        z.object({
          role: z.literal("patient"),
        })
      ).strict(),
    ]),
  }),
})

export const ArchiveProcessSchema = z.object({
  body: z.object({
    token: z.string(),
    processId: z.number(),
  }),
})

export const ProcessInfoSchema = z.object({
  body: z.object({
    token: z.string(),
    processId: z.number(),
  }),
})

export const ProcessListSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
})

export const ProcessCreateSchema = z.object({
  body: z.object({
    token: z.string(),
    patientId: z.number(),
    therapistId: z.number(),
    speciality: z.string(),
    remarks: z.string(),
  }),
})

export const ProcessEditSchema = z.object({
  body: z.object({
    token: z.string(),
    therapistId: z.number(),
    speciality: z.string(),
    remarks: z.string(),
    colaborators: z.array(z.number()),
    processId: z.number(),
  }),
})

export const ProcessEditPermissionsSchema = z.object({
  body: z.object({
    token: z.string(),
    processId: z.number(),
    collaboratorId: z.number(),
    appoint: z.boolean(),
    statitics: z.boolean(),
    editProcess: z.boolean(),
    editPatient: z.boolean(),
    archive: z.boolean(),
    see: z.boolean(),
  }),
})

export const AppointmentCreateSchema = z.object({
  body: z.object({
    token: z.string(),
    online: z.boolean(),
    roomId: z.number(),
    priceTableId: z.string(),
    startDate: DateSchema,
    endDate: DateSchema,
    processId: z.number(),
  }),
})

export const AppointmentArchiveSchema = z.object({
  body: z.object({
    token: z.string(),
    appointmentId: z.number(),
  }),
})

export const AppointmentsListSchema = z.object({
  body: z.object({
    token: z.string(),
    filterId: z.number(), //can either be -1 for all, an id of a therapist for their appointments or of an intern
  }),
})

export const AppointmentInfoSchema = z.object({
  body: z.object({
    token: z.string(),
    appointmentId: z.number(),
  }),
})

export const AppointmentEditSchema = z.object({
  body: z.object({
    token: z.string(),
    appointmentId: z.number(),
    appointmentStart: DateSchema,
    appointmentEnd: DateSchema,
    appointmentRoomId: z.number(),
  }),
})

export default {
  RegistrationSchema,
  LoginSchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyAccountSchema,
  ArchiveProcessSchema,
  AccountVerificationSchema,
  DateSchema,
  ProcessListSchema,
  ProcessInfoSchema,
  ProcessCreateSchema,
  ProcessEditSchema,
  EditUserSchema,
  ProcessEditPermissionsSchema,
  AppointmentArchiveSchema,
  AppointmentCreateSchema,
  AppointmentsListSchema,
  AppointmentInfoSchema,
  AppointmentEditSchema,
  EditProfileSchema,
  TherapistUpdateSchema,
  InternUpdateSchema,
  GuardUpdateSchema,
  AccountantUpdateSchema,
  AdminUpdateSchema,
}
