import z from "zod"

export enum User {
  ADMIN = "admin",
  THERAPIST = "therapist",
  INTERN = "intern",
  ACCOUNTANT = "accountant",
  GUARD = "guard",
}

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
        role: z.literal(User.ADMIN),
      })
    ).strict(),
    GuardSchema.merge(
      z.object({
        role: z.literal(User.GUARD),
      })
    ).strict(),
    TherapistSchema.merge(
      z.object({
        role: z.literal(User.THERAPIST),
      })
    ).strict(),
    InternSchema.merge(
      z.object({
        role: z.literal(User.INTERN),
      })
    ).strict(),
    AccountantSchema.merge(
      z.object({
        role: z.literal(User.ACCOUNTANT),
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

export const SelfEditProfileSchema = z.object({
  body: z.union([
    AdminSchema.strict(),
    GuardSchema.strict(),
    TherapistSchema.strict(),
    InternSchema.strict(),
    AccountantSchema.strict(),
  ]),
})

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

export const EditProfileParamsSchema = z.object({
  params: z
    .object({
      user: z
        .string()
        .min(1)
        .transform((s) => Number(s)),
    })
    .strict(),
})

export const EditProfileSchema = z.object({
  params: z
    .object({
      user: z
        .string()
        .min(1)
        .transform((s) => Number(s)),
    })
    .strict(),
  body: z.union([
    AdminUpdateSchema.strict(),
    GuardUpdateSchema.strict(),
    TherapistUpdateSchema.strict(),
    InternUpdateSchema.strict(),
    AccountantUpdateSchema.strict(),
  ]),
})

export const ProcessIDSchema = z.object({
  params: z
    .object({
      processId: z.string(),
    })
    .strict(),
})

export const QueryListProcess = z.object({
  query: z.object({
    active: z.string(),
    speciality: z.string(),
  }),
})

export const ProcessCreateSchema = z.object({
  body: z.object({
    patientIds: z.array(z.number()),
    therapistId: z.number(),
    speciality: z.string(),
    remarks: z.string(),
    colaborators: z.array(z.number()),
  }),
})

export const ProcessEditSchema = z.object({
  body: z.object({
    therapistId: z.number(),
    speciality: z.string(),
    remarks: z.string(),
    colaborators: z.array(z.number()),
  }),
})

export const ProcessEditPermissionsSchema = z.object({
  body: z.object({
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
    processId: z.number(),
    online: z.boolean(),
    roomId: z.number(),
    priceTableId: z.string(),
    startDate: DateSchema,
    endDate: DateSchema,
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

export enum NotificationFilterType {
  READ = "read",
  UNREAD = "unread",
}

export const NotificationFilterSchema = z.object({
  filter: z.enum([NotificationFilterType.READ, NotificationFilterType.UNREAD]).optional(),
})

export const ReceiptListQuery = z.object({
  query: z.object({
    payed: z.string(),
    notPayed: z.string(),
    userId: z.string(),
  }),
})

export const NotesCreate = z.object({
  body: z.object({
    title: z.string(),
    body: z.string(),
  }),
})

export const QueryListRooms = z.object({
  query: z.object({
    date: z.string(),
    room: z.string(),
  }),
})

export const RoomCreate = z.object({
  body: z.object({
    name: z.string(),
  }),
})

export const QueryStatistics = z.object({
  query: z.object({
    startDate: z.string(),
    endDate: z.string(),
    therapistId: z.string(),
    specialityId: z.string(),
    processId: z.string(),
  }),
})

export default {
  RegistrationSchema,
  LoginSchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyAccountSchema,
  AccountVerificationSchema,
  DateSchema,
  ProcessCreateSchema,
  ProcessEditSchema,
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
  NotificationFilterSchema,
  TherapistSchema,
  AccountantSchema,
  GuardSchema,
  AdminSchema,
  InternSchema,
  SelfEditProfileSchema,
  EditProfileParamsSchema,
  ProcessIDSchema,
  QueryListProcess,
  ReceiptListQuery,
  NotesCreate,
  QueryListRooms,
  RoomCreate,
  QueryStatistics,
}
