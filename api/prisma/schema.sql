CREATE TABLE person (
	id		 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	email	 VARCHAR(512) NOT NULL,
	password	 VARCHAR(512) NOT NULL,
	address	 VARCHAR(512) NOT NULL,
	birth_date	 DATE NOT NULL,
	phone_number BIGINT NOT NULL,
	active	 BOOL NOT NULL,
	aproved	 BOOL NOT NULL,
	photo	 VARCHAR(512),
	PRIMARY KEY(id)
);

CREATE TABLE patient (
	tax_number	 BIGINT NOT NULL,
	health_number	 BIGINT NOT NULL,
	request	 VARCHAR(512) NOT NULL,
	remarks	 VARCHAR(512),
	patienttype_id BIGINT NOT NULL,
	person_id	 BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE accountant (
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE therapist (
	extern	 BOOL NOT NULL,
	admin	 BOOL NOT NULL,
	cedula	 VARCHAR(512),
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE guard (
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE liable (
	id		 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	email	 VARCHAR(512) NOT NULL,
	phonenumber BIGINT NOT NULL,
	type	 VARCHAR(512) NOT NULL,
	remarks	 VARCHAR(512),
	PRIMARY KEY(id)
);

CREATE TABLE patienttype (
	id	 BIGINT,
	type VARCHAR(512) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE school (
	id		 BIGSERIAL,
	name		 BIGINT NOT NULL,
	course		 VARCHAR(512) NOT NULL,
	grade		 BIGINT,
	patient_person_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE profession (
	id		 BIGINT,
	name		 VARCHAR(512) NOT NULL,
	patient_person_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE intern (
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE process (
	id	 BIGSERIAL,
	ref	 VARCHAR(512) NOT NULL,
	active BOOL NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE availability (
	slot_id	 BIGINT,
	slot_start_date TIMESTAMP NOT NULL,
	slot_end_date	 TIMESTAMP NOT NULL,
	PRIMARY KEY(slot_id)
);

CREATE TABLE appointment (
	online		 BOOL,
	room_id	 BIGINT NOT NULL,
	pricetable_id	 VARCHAR(512) NOT NULL,
	slot_id	 BIGINT,
	slot_start_date TIMESTAMP NOT NULL,
	slot_end_date	 TIMESTAMP NOT NULL,
	PRIMARY KEY(slot_id)
);

CREATE TABLE receipt (
	id			 BIGSERIAL,
	ref		 VARCHAR(512) NOT NULL,
	name		 VARCHAR(512) NOT NULL,
	description	 VARCHAR(512) NOT NULL,
	datetime		 TIMESTAMP NOT NULL,
	therapist		 VARCHAR(512),
	appointment_slot_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE pricetable (
	id	 VARCHAR(512),
	type	 VARCHAR(512) NOT NULL,
	price FLOAT(8) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE room (
	id	 BIGSERIAL,
	name VARCHAR(512) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE intern_process (
	intern_person_id BIGINT,
	process_id	 BIGINT,
	PRIMARY KEY(intern_person_id,process_id)
);

CREATE TABLE therapist_process (
	therapist_person_id BIGINT,
	process_id		 BIGINT,
	PRIMARY KEY(therapist_person_id,process_id)
);

CREATE TABLE appointment_process (
	appointment_slot_id BIGINT,
	process_id		 BIGINT,
	PRIMARY KEY(appointment_slot_id,process_id)
);

CREATE TABLE intern_availability (
	intern_person_id	 BIGINT,
	availability_slot_id BIGINT,
	PRIMARY KEY(intern_person_id,availability_slot_id)
);

CREATE TABLE therapist_availability (
	therapist_person_id	 BIGINT,
	availability_slot_id BIGINT,
	PRIMARY KEY(therapist_person_id,availability_slot_id)
);

CREATE TABLE process_liable (
	process_id BIGINT,
	liable_id	 BIGINT,
	PRIMARY KEY(process_id,liable_id)
);

CREATE TABLE patient_process (
	patient_person_id BIGINT,
	process_id	 BIGINT,
	PRIMARY KEY(patient_person_id,process_id)
);

ALTER TABLE patient ADD CONSTRAINT patient_fk1 FOREIGN KEY (patienttype_id) REFERENCES patienttype(id);
ALTER TABLE patient ADD CONSTRAINT patient_fk2 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE accountant ADD CONSTRAINT accountant_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE therapist ADD CONSTRAINT therapist_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE guard ADD CONSTRAINT guard_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE school ADD UNIQUE (grade);
ALTER TABLE school ADD CONSTRAINT school_fk1 FOREIGN KEY (patient_person_id) REFERENCES patient(person_id);
ALTER TABLE profession ADD UNIQUE (name);
ALTER TABLE profession ADD CONSTRAINT profession_fk1 FOREIGN KEY (patient_person_id) REFERENCES patient(person_id);
ALTER TABLE intern ADD CONSTRAINT intern_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE process ADD UNIQUE (ref);
ALTER TABLE appointment ADD CONSTRAINT appointment_fk1 FOREIGN KEY (room_id) REFERENCES room(id);
ALTER TABLE appointment ADD CONSTRAINT appointment_fk2 FOREIGN KEY (pricetable_id) REFERENCES pricetable(id);
ALTER TABLE receipt ADD UNIQUE (ref);
ALTER TABLE receipt ADD CONSTRAINT receipt_fk1 FOREIGN KEY (appointment_slot_id) REFERENCES appointment(slot_id);
ALTER TABLE room ADD UNIQUE (name);
ALTER TABLE intern_process ADD CONSTRAINT intern_process_fk1 FOREIGN KEY (intern_person_id) REFERENCES intern(person_id);
ALTER TABLE intern_process ADD CONSTRAINT intern_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE therapist_process ADD CONSTRAINT therapist_process_fk1 FOREIGN KEY (therapist_person_id) REFERENCES therapist(person_id);
ALTER TABLE therapist_process ADD CONSTRAINT therapist_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE appointment_process ADD CONSTRAINT appointment_process_fk1 FOREIGN KEY (appointment_slot_id) REFERENCES appointment(slot_id);
ALTER TABLE appointment_process ADD CONSTRAINT appointment_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE intern_availability ADD CONSTRAINT intern_availability_fk1 FOREIGN KEY (intern_person_id) REFERENCES intern(person_id);
ALTER TABLE intern_availability ADD CONSTRAINT intern_availability_fk2 FOREIGN KEY (availability_slot_id) REFERENCES availability(slot_id);
ALTER TABLE therapist_availability ADD CONSTRAINT therapist_availability_fk1 FOREIGN KEY (therapist_person_id) REFERENCES therapist(person_id);
ALTER TABLE therapist_availability ADD CONSTRAINT therapist_availability_fk2 FOREIGN KEY (availability_slot_id) REFERENCES availability(slot_id);
ALTER TABLE process_liable ADD CONSTRAINT process_liable_fk1 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE process_liable ADD CONSTRAINT process_liable_fk2 FOREIGN KEY (liable_id) REFERENCES liable(id);
ALTER TABLE patient_process ADD CONSTRAINT patient_process_fk1 FOREIGN KEY (patient_person_id) REFERENCES patient(person_id);
ALTER TABLE patient_process ADD CONSTRAINT patient_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);

