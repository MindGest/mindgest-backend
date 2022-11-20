import { callbackPromise } from "nodemailer/lib/shared"
import z, { ZodAny } from "zod"

export const DateSchema = z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

export const PersonSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  address: z.string(),
  birthDate: DateSchema,
  phoneNumber: z.number(),
  nif: z.number(),
})

export const PersonUpdateSchema = z.object({
  active: z.boolean(),
  aproved: z.boolean(),
}).merge(PersonSchema)

export const TherapistSchema = z.object({
  healthsystem: z.string().optional(), 
  cedula: z.string(),
}).merge(PersonSchema)

export const TherapistUpdateSchema = z.object({
  healthsystem: z.string().optional(), 
  cedula: z.string(),
  extern: z.boolean(),
}).merge(PersonUpdateSchema)

export const PatientSchema = z.object({
  tax_number: z.number(),
  health_number: z.number(),
  request: z.string(),
  remarks: z.string(),
  patienttype_id: z.number(),
}).merge(PersonUpdateSchema)

export const AdminSchema = PersonSchema
export const GuardSchema = PersonSchema
export const InternSchema = PersonSchema
export const AccountantSchema = PersonSchema

export const AdminUpdateSchema = PersonUpdateSchema
export const GuardUpdateSchema = PersonUpdateSchema
export const InternUpdateSchema = PersonUpdateSchema
export const AccountantUpdateSchema = PersonUpdateSchema

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
          GuardUpdateSchema.
          merge(
            z.object({
              role: z.literal("guard"),
            })
          ).strict(),
          TherapistUpdateSchema.
          merge(
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
      processId: z.number()
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
    processId: z.number(),
    patientId: z.number(),
    terapeutaId: z.number(),
    speciality: z.string(),
      remarks: z.string()
  }),
})



export const ProcessEditSchema = z.object({
  body: z.object({
    token: z.string(),
    terapeutaId: z.number(),
    speciality: z.string(),
    remarks: z.string(),
      interns: z.array(z.number())
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
}
