CREATE TABLE person (
	id		 BIGSERIAL,
	name	 VARCHAR(512) NOT NULL,
	email	 VARCHAR(512) NOT NULL,
	password	 VARCHAR(512) NOT NULL,
	address	 VARCHAR(512) NOT NULL,
	birthdate	 DATE NOT NULL,
	phonenumber NUMERIC(8,2) NOT NULL,
	active	 BOOL NOT NULL,
	aproved	 BOOL NOT NULL,
	photo	 VARCHAR(512),
	PRIMARY KEY(id)
);

CREATE TABLE patient (
	tax_number	 BIGINT,
	health_number	 BIGINT,
	request	 VARCHAR(512),
	remarks	 VARCHAR(512),
	profession	 BOOL,
	patienttype_id BIGINT NOT NULL,
	person_id	 BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE accountant (
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE therapist (
	extern	 BOOL,
	admin	 BOOL,
	cedula	 VARCHAR(512),
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE guard (
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE sponsor (
	type	 VARCHAR(512),
	name	 VARCHAR(512),
	email	 VARCHAR(512),
	phonenumber BIGINT,
	remarks	 VARCHAR(512),
	PRIMARY KEY(name)
);

CREATE TABLE patienttype (
	id	 BIGINT,
	name VARCHAR(512),
	PRIMARY KEY(id)
);

CREATE TABLE school (
	id		 BOOL,
	name		 BIGINT,
	course		 BOOL,
	school_year	 BOOL,
	patient_person_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE profession (
	id		 BIGINT,
	name		 BOOL,
	patient_person_id BIGINT NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE intern (
	person_id BIGINT,
	PRIMARY KEY(person_id)
);

CREATE TABLE process (
	id	 VARCHAR(512),
	active BOOL,
	PRIMARY KEY(id)
);

CREATE TABLE availability (
	slot_start_time TIMESTAMP,
	slot_end_time	 TIMESTAMP,
	PRIMARY KEY(slot_start_time)
);

CREATE TABLE appointment (
	id		 VARCHAR(512),
	type		 BOOL,
	online		 BOOL,
	rooms_nome	 VARCHAR(512) NOT NULL,
	prices_type	 VARCHAR(512) NOT NULL,
	slot_start_time TIMESTAMP,
	slot_end_time	 TIMESTAMP,
	PRIMARY KEY(slot_start_time)
);

CREATE TABLE receipt (
	name			 BIGINT,
	description		 VARCHAR(512),
	price			 BIGINT,
	datetime			 TIMESTAMP,
	therapist			 VARCHAR(512),
	appointment_slot_start_time TIMESTAMP NOT NULL,
	PRIMARY KEY(name)
);

CREATE TABLE prices (
	type	 VARCHAR(512),
	price FLOAT(8),
	PRIMARY KEY(type)
);

CREATE TABLE rooms (
	nome VARCHAR(512),
	PRIMARY KEY(nome)
);

CREATE TABLE refreshtoken (
	refreshtoken VARCHAR(512),
	ip		 VARCHAR(512),
	useragent	 VARCHAR(512),
	isvalid	 BOOL,
	person_id	 BIGINT NOT NULL,
	PRIMARY KEY(refreshtoken)
);

CREATE TABLE intern_process (
	intern_person_id BIGINT,
	process_id	 VARCHAR(512),
	PRIMARY KEY(intern_person_id,process_id)
);

CREATE TABLE therapist_process (
	therapist_person_id BIGINT,
	process_id		 VARCHAR(512),
	PRIMARY KEY(therapist_person_id,process_id)
);

CREATE TABLE appointment_process (
	appointment_slot_start_time TIMESTAMP,
	process_id			 VARCHAR(512),
	PRIMARY KEY(appointment_slot_start_time,process_id)
);

CREATE TABLE intern_availability (
	intern_person_id		 BIGINT,
	availability_slot_start_time TIMESTAMP,
	PRIMARY KEY(intern_person_id,availability_slot_start_time)
);

CREATE TABLE therapist_availability (
	therapist_person_id		 BIGINT,
	availability_slot_start_time TIMESTAMP,
	PRIMARY KEY(therapist_person_id,availability_slot_start_time)
);

CREATE TABLE process_sponsor (
	process_id	 VARCHAR(512),
	sponsor_name VARCHAR(512),
	PRIMARY KEY(process_id,sponsor_name)
);

CREATE TABLE patient_process (
	patient_person_id BIGINT,
	process_id	 VARCHAR(512),
	PRIMARY KEY(patient_person_id,process_id)
);

ALTER TABLE patient ADD CONSTRAINT patient_fk1 FOREIGN KEY (patienttype_id) REFERENCES patienttype(id);
ALTER TABLE patient ADD CONSTRAINT patient_fk2 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE accountant ADD CONSTRAINT accountant_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE therapist ADD CONSTRAINT therapist_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE guard ADD CONSTRAINT guard_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE school ADD CONSTRAINT school_fk1 FOREIGN KEY (patient_person_id) REFERENCES patient(person_id);
ALTER TABLE profession ADD CONSTRAINT profession_fk1 FOREIGN KEY (patient_person_id) REFERENCES patient(person_id);
ALTER TABLE intern ADD CONSTRAINT intern_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE appointment ADD CONSTRAINT appointment_fk1 FOREIGN KEY (rooms_nome) REFERENCES rooms(nome);
ALTER TABLE appointment ADD CONSTRAINT appointment_fk2 FOREIGN KEY (prices_type) REFERENCES prices(type);
ALTER TABLE receipt ADD CONSTRAINT receipt_fk1 FOREIGN KEY (appointment_slot_start_time) REFERENCES appointment(slot_start_time);
ALTER TABLE refreshtoken ADD CONSTRAINT refreshtoken_fk1 FOREIGN KEY (person_id) REFERENCES person(id);
ALTER TABLE intern_process ADD CONSTRAINT intern_process_fk1 FOREIGN KEY (intern_person_id) REFERENCES intern(person_id);
ALTER TABLE intern_process ADD CONSTRAINT intern_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE therapist_process ADD CONSTRAINT therapist_process_fk1 FOREIGN KEY (therapist_person_id) REFERENCES therapist(person_id);
ALTER TABLE therapist_process ADD CONSTRAINT therapist_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE appointment_process ADD CONSTRAINT appointment_process_fk1 FOREIGN KEY (appointment_slot_start_time) REFERENCES appointment(slot_start_time);
ALTER TABLE appointment_process ADD CONSTRAINT appointment_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE intern_availability ADD CONSTRAINT intern_availability_fk1 FOREIGN KEY (intern_person_id) REFERENCES intern(person_id);
ALTER TABLE intern_availability ADD CONSTRAINT intern_availability_fk2 FOREIGN KEY (availability_slot_start_time) REFERENCES availability(slot_start_time);
ALTER TABLE therapist_availability ADD CONSTRAINT therapist_availability_fk1 FOREIGN KEY (therapist_person_id) REFERENCES therapist(person_id);
ALTER TABLE therapist_availability ADD CONSTRAINT therapist_availability_fk2 FOREIGN KEY (availability_slot_start_time) REFERENCES availability(slot_start_time);
ALTER TABLE process_sponsor ADD CONSTRAINT process_sponsor_fk1 FOREIGN KEY (process_id) REFERENCES process(id);
ALTER TABLE process_sponsor ADD CONSTRAINT process_sponsor_fk2 FOREIGN KEY (sponsor_name) REFERENCES sponsor(name);
ALTER TABLE patient_process ADD CONSTRAINT patient_process_fk1 FOREIGN KEY (patient_person_id) REFERENCES patient(person_id);
ALTER TABLE patient_process ADD CONSTRAINT patient_process_fk2 FOREIGN KEY (process_id) REFERENCES process(id);

