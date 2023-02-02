CREATE TABLE "person" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" String NOT NULL,
  "email" String NOT NULL,
  "password" String NOT NULL,
  "address" String NOT NULL,
  "birth_date" DateTime NOT NULL,
  "photo" String,
  "phone_number" BigInt NOT NULL,
  "verified" Boolean NOT NULL,
  "active" Boolean NOT NULL,
  "approved" Boolean NOT NULL,
  "tax_number" BigInt,
  "accountant" accountant,
  "admin" admin,
  "guard" guard,
  "intern" intern,
  "notifications" notifications NOT NULL,
  "patient" patient,
  "permissions" permissions NOT NULL,
  "therapist" therapist
);

CREATE TABLE "therapist" (
  "extern" Boolean NOT NULL,
  "license" String,
  "health_system" String,
  "person_id" BigInt PRIMARY KEY,
  "person" person NOT NULL,
  "therapist_process" therapist_process NOT NULL,
  "therapist_speciality" therapist_speciality NOT NULL
);

CREATE TABLE "guard" (
  "person_id" BigInt PRIMARY KEY,
  "person" person NOT NULL
);

CREATE TABLE "admin" (
  "person_id" BigInt PRIMARY KEY,
  "person" person NOT NULL
);

CREATE TABLE "intern" (
  "person_id" BigInt PRIMARY KEY,
  "person" person NOT NULL,
  "intern_process" intern_process NOT NULL
);

CREATE TABLE "accountant" (
  "person_id" BigInt PRIMARY KEY,
  "person" person NOT NULL
);

CREATE TABLE "patient" (
  "health_number" BigInt NOT NULL,
  "request" String NOT NULL,
  "remarks" String,
  "patienttype_id" BigInt NOT NULL,
  "person_id" BigInt PRIMARY KEY,
  "patienttype" patienttype NOT NULL,
  "person" person NOT NULL,
  "patient_process" patient_process NOT NULL,
  "profession" profession NOT NULL,
  "school" school NOT NULL
);

CREATE TABLE "school" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" String NOT NULL,
  "course" String NOT NULL,
  "grade" BigInt UNIQUE,
  "patient_person_id" BigInt NOT NULL,
  "patient" patient NOT NULL
);

CREATE TABLE "appointment" (
  "slot_id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "slot_start_date" DateTime NOT NULL,
  "slot_end_date" DateTime NOT NULL,
  "archived_date" DateTime,
  "active" Boolean,
  "online" Boolean,
  "room_id" BigInt NOT NULL,
  "pricetable_id" String NOT NULL,
  "room" room NOT NULL,
  "pricetable" pricetable NOT NULL,
  "appointment_process" appointment_process NOT NULL,
  "receipt" receipt NOT NULL
);

CREATE TABLE "appointment_process" (
  "appointment_slot_id" BigInt NOT NULL,
  "process_id" BigInt NOT NULL,
  "appointment" appointment NOT NULL,
  "process" process NOT NULL,
  PRIMARY KEY ("appointment_slot_id", "process_id")
);

CREATE TABLE "intern_process" (
  "intern_person_id" BigInt NOT NULL,
  "process_id" BigInt NOT NULL,
  "intern" intern NOT NULL,
  "process" process NOT NULL,
  PRIMARY KEY ("intern_person_id", "process_id")
);

CREATE TABLE "liable" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" String NOT NULL,
  "email" String NOT NULL,
  "phonenumber" BigInt NOT NULL,
  "type" String NOT NULL,
  "remarks" String,
  "process_liable" process_liable NOT NULL
);

CREATE TABLE "notifications" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "ref" String NOT NULL,
  "datetime" DateTime NOT NULL DEFAULT (now()),
  "data" String NOT NULL,
  "type" String NOT NULL,
  "seen" Boolean NOT NULL,
  "settled" Boolean NOT NULL,
  "person_id" BigInt NOT NULL,
  "person" person NOT NULL
);

CREATE TABLE "patient_process" (
  "patient_person_id" BigInt NOT NULL,
  "process_id" BigInt NOT NULL,
  "patient" patient NOT NULL,
  "process" process NOT NULL,
  PRIMARY KEY ("patient_person_id", "process_id")
);

CREATE TABLE "patienttype" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "type" String NOT NULL,
  "patient" patient NOT NULL
);

CREATE TABLE "permissions" (
  "editprocess" Boolean NOT NULL DEFAULT false,
  "see" Boolean NOT NULL DEFAULT false,
  "appoint" Boolean NOT NULL DEFAULT false,
  "statitics" Boolean NOT NULL DEFAULT false,
  "editpatitent" Boolean NOT NULL DEFAULT false,
  "archive" Boolean NOT NULL DEFAULT false,
  "isMain" Boolean NOT NULL DEFAULT false,
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "person_id" BigInt NOT NULL,
  "process_id" BigInt NOT NULL,
  "person" person NOT NULL,
  "process" process NOT NULL
);

CREATE TABLE "pricetable" (
  "id" String PRIMARY KEY,
  "type" String NOT NULL,
  "price" Float NOT NULL,
  "appointment" appointment NOT NULL
);

CREATE TABLE "process" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "ref" String UNIQUE NOT NULL,
  "active" Boolean NOT NULL,
  "remarks" String,
  "speciality_speciality" String NOT NULL,
  "appointment_process" appointment_process NOT NULL,
  "intern_process" intern_process NOT NULL,
  "notes" notes NOT NULL,
  "patient_process" patient_process NOT NULL,
  "permissions" permissions NOT NULL,
  "speciality" speciality NOT NULL,
  "process_liable" process_liable NOT NULL,
  "therapist_process" therapist_process NOT NULL
);

CREATE TABLE "notes" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "title" String NOT NULL,
  "body" String NOT NULL,
  "process_id" BigInt NOT NULL,
  "datetime" DateTime NOT NULL,
  "process" process NOT NULL
);

CREATE TABLE "process_liable" (
  "process_id" BigInt NOT NULL,
  "liable_id" BigInt NOT NULL,
  "process" process NOT NULL,
  "liable" liable NOT NULL,
  PRIMARY KEY ("process_id", "liable_id")
);

CREATE TABLE "profession" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" String UNIQUE NOT NULL,
  "patient_person_id" BigInt NOT NULL,
  "patient" patient NOT NULL
);

CREATE TABLE "receipt" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "datetime" DateTime NOT NULL DEFAULT (now()),
  "payed" Boolean DEFAULT false,
  "appointment_slot_id" BigInt NOT NULL,
  "appointment" appointment NOT NULL
);

CREATE TABLE "room" (
  "id" BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" String UNIQUE NOT NULL,
  "appointment" appointment NOT NULL
);

CREATE TABLE "speciality" (
  "speciality" String PRIMARY KEY,
  "code" String NOT NULL,
  "description" String NOT NULL,
  "process" process NOT NULL,
  "therapist_speciality" therapist_speciality NOT NULL
);

CREATE TABLE "therapist_process" (
  "therapist_person_id" BigInt NOT NULL,
  "process_id" BigInt NOT NULL,
  "therapist" therapist NOT NULL,
  "process" process NOT NULL,
  PRIMARY KEY ("therapist_person_id", "process_id")
);

CREATE TABLE "therapist_speciality" (
  "therapist_person_id" BigInt NOT NULL,
  "speciality_speciality" String NOT NULL,
  "therapist" therapist NOT NULL,
  "speciality" speciality NOT NULL,
  PRIMARY KEY ("therapist_person_id", "speciality_speciality")
);

ALTER TABLE "person" ADD FOREIGN KEY ("id") REFERENCES "therapist" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "person" ADD FOREIGN KEY ("id") REFERENCES "guard" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "person" ADD FOREIGN KEY ("id") REFERENCES "admin" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "person" ADD FOREIGN KEY ("id") REFERENCES "intern" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "person" ADD FOREIGN KEY ("id") REFERENCES "accountant" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "patient" ADD FOREIGN KEY ("patienttype_id") REFERENCES "patienttype" ("id") ON DELETE NO ACTION;

ALTER TABLE "person" ADD FOREIGN KEY ("id") REFERENCES "patient" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "school" ADD FOREIGN KEY ("patient_person_id") REFERENCES "patient" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "appointment" ADD FOREIGN KEY ("room_id") REFERENCES "room" ("id") ON DELETE NO ACTION;

ALTER TABLE "appointment" ADD FOREIGN KEY ("pricetable_id") REFERENCES "pricetable" ("id") ON DELETE NO ACTION;

ALTER TABLE "appointment_process" ADD FOREIGN KEY ("appointment_slot_id") REFERENCES "appointment" ("slot_id") ON DELETE NO ACTION;

ALTER TABLE "appointment_process" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "intern_process" ADD FOREIGN KEY ("intern_person_id") REFERENCES "intern" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "intern_process" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "notifications" ADD FOREIGN KEY ("person_id") REFERENCES "person" ("id") ON DELETE NO ACTION;

ALTER TABLE "patient_process" ADD FOREIGN KEY ("patient_person_id") REFERENCES "patient" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "patient_process" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "permissions" ADD FOREIGN KEY ("person_id") REFERENCES "person" ("id") ON DELETE NO ACTION;

ALTER TABLE "permissions" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "process" ADD FOREIGN KEY ("speciality_speciality") REFERENCES "speciality" ("speciality") ON DELETE NO ACTION;

ALTER TABLE "notes" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "process_liable" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "process_liable" ADD FOREIGN KEY ("liable_id") REFERENCES "liable" ("id") ON DELETE NO ACTION;

ALTER TABLE "profession" ADD FOREIGN KEY ("patient_person_id") REFERENCES "patient" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "receipt" ADD FOREIGN KEY ("appointment_slot_id") REFERENCES "appointment" ("slot_id") ON DELETE NO ACTION;

ALTER TABLE "therapist_process" ADD FOREIGN KEY ("therapist_person_id") REFERENCES "therapist" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "therapist_process" ADD FOREIGN KEY ("process_id") REFERENCES "process" ("id") ON DELETE NO ACTION;

ALTER TABLE "therapist_speciality" ADD FOREIGN KEY ("therapist_person_id") REFERENCES "therapist" ("person_id") ON DELETE NO ACTION;

ALTER TABLE "therapist_speciality" ADD FOREIGN KEY ("speciality_speciality") REFERENCES "speciality" ("speciality") ON DELETE NO ACTION;
