DROP TABLE pertenencias;
DROP TABLE alergias;
DROP TABLE antecedentes;
DROP TABLE atecedentes_familiares;
DROP TABLE condicion;
DROP TABLE enfermedades;
DROP TABLE medicamentos;
DROP TABLE vacunas;
DROP TABLE pacientes;
DROP TABLE dbbomberos;
DROP TABLE dbdefensacivil;
DROP TABLE dbmedicina;
DROP TABLE dbpolicia;
DROP TABLE contactos;
DROP TABLE petsVaccine;
DROP TABLE petsMedicament;
DROP TABLE petsDiseaseCondition;
DROP TABLE petsVeterinarian;
DROP TABLE mascotas;
DROP TABLE users;
DROP TABLE townships;
DROP TABLE departments;
DROP TABLE codes;
DROP TABLE ingreso_salud;
DROP TABLE personal_salud;
DROP TABLE license;



DROP TABLE IF EXISTS dbpolicia CASCADE;
CREATE TABLE dbPolicia(
	id BIGSERIAL PRIMARY KEY,
	nombres VARCHAR(100) NOT NULL UNIQUE,
	apellidos VARCHAR(100) NOT NULL UNIQUE,
	cedula VARCHAR(100) NOT NULL UNIQUE,
	placa VARCHAR(100)  NOT NULL UNIQUE
);


DROP TABLE IF EXISTS dbbomberos CASCADE;
CREATE TABLE dbBomberos(
	id BIGSERIAL PRIMARY KEY,
	nombres VARCHAR(100) NOT NULL UNIQUE,
	apellidos VARCHAR(100) NOT NULL UNIQUE,
	cedula VARCHAR(100) NOT NULL UNIQUE,
	registro_bomberos VARCHAR(100)  NOT NULL UNIQUE
);


DROP TABLE IF EXISTS dbdefensacivil CASCADE;
CREATE TABLE dbDefensaCivil(
	id BIGSERIAL PRIMARY KEY,
	nombres VARCHAR(100) NOT NULL UNIQUE,
	apellidos VARCHAR(100) NOT NULL UNIQUE,
	cedula VARCHAR(100) NOT NULL UNIQUE,
	registro_defensa_civil VARCHAR(100)  NOT NULL UNIQUE
);


DROP TABLE IF EXISTS dbmedicina CASCADE;
CREATE TABLE dbMedicina(
	id BIGSERIAL PRIMARY KEY,
	nombres VARCHAR(100) NOT NULL UNIQUE,
	apellidos VARCHAR(100) NOT NULL UNIQUE,
	cedula VARCHAR(100) NOT NULL UNIQUE,
	registro_medico VARCHAR(100)  NOT NULL UNIQUE
);

DROP TABLE IF EXISTS codes CASCADE;
CREATE TABLE codes(
	id BIGSERIAL PRIMARY KEY,
	code VARCHAR(100) NOT NULL UNIQUE,
	hashcode VARCHAR(100) NOT NULL UNIQUE, 
	license VARCHAR(50) NOT NULL, --
	agreement VARCHAR(50) NOT NULL, --
	created_at TIMESTAMP(0) NOT NULL
);


DROP TABLE IF EXISTS license CASCADE;
CREATE TABLE license(
	id BIGSERIAL PRIMARY KEY,
	code VARCHAR(100) NOT NULL UNIQUE, 
	agreement VARCHAR(50) NOT NULL UNIQUE,
	discount DECIMAL(10) NOT NULL UNIQUE,
	price integer NOT NULL UNIQUE,
	total DECIMAL(100) NOT NULL UNIQUE,
	created_at TIMESTAMP(0) NOT NULL
);


-- nueva tabla
DROP TABLE IF EXISTS departments;
CREATE TABLE departments (
  id BIGSERIAL PRIMARY KEY NOT NULL,
  name varchar(255) NOT NULL,
  code integer NOT NULL
);

-- nueva tabla
CREATE TABLE townships (
	id BIGSERIAL PRIMARY KEY,
	department_id BIGINT NOT NULL,
	code VARCHAR(255) NOT NULL,
	name VARCHAR(255) NOT NULL,
	FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE ON DELETE CASCADE
);


DROP TABLE IF EXISTS users CASCADE; 
CREATE TABLE users(
	id BIGSERIAL PRIMARY KEY,
	code VARCHAR(100) NOT NULL UNIQUE,
	hashcode VARCHAR(200) NULL UNIQUE, --
	name VARCHAR(100) NOT NULL,
	lastname VARCHAR(100) NOT NULL,
	typePerson VARCHAR(100) NULL,   --
	typeID VARCHAR(100) NOT NULL,    
	numberID VARCHAR(80) NULL,
	address VARCHAR(100) NULL,  -- New column
	city_id BIGINT NULL,  	-- New column
	phone VARCHAR(80) NOT NULL ,
	email VARCHAR(255) NOT NULL UNIQUE,
	parentesco VARCHAR(100) NULL,
	notificationID VARCHAR(255)  NULL UNIQUE,
	password VARCHAR(255)  NULL,
	session_token VARCHAR(255) NULL,
	verificado BOOLEAN NOT NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (code) REFERENCES codes(code) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (city_id) REFERENCES townships(id) ON UPDATE CASCADE ON DELETE CASCADE
);



DROP TABLE IF EXISTS pertenencias;
CREATE TABLE pertenencias(
	id BIGSERIAL PRIMARY KEY,
	id_user BIGINT NOT NULL,
	hashcode VARCHAR(80) NOT NULL,
	objeto VARCHAR(50) NOT NULL,
	descripcion VARCHAR(1000) NULL,
	created_at TIMESTAMP(0) NULL,
	FOREIGN KEY (id_user) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);	

DROP TABLE IF EXISTS mascotas;
CREATE TABLE mascotas(
	id BIGSERIAL PRIMARY KEY,
	id_usuario BIGINT NOT NULL,
	hashcode VARCHAR(80) NOT NULL,
	petid VARCHAR(80) NOT NULL,
	nombre VARCHAR(50) NOT NULL,
	especie VARCHAR(50) NOT NULL,
	raza VARCHAR(50) NOT NULL,
    peso VARCHAR(50) NOT NULL,
    sexo VARCHAR(50) NOT NULL,
	color VARCHAR(100) NOT NULL, --
	fechaNacimiento DATE NOT NULL, 
	descripcion VARCHAR(1000) NOT NULL,
	seguro VARCHAR(100) NOT NULL,
	estatura VARCHAR(50) NOT NULL, 
	temperamento VARCHAR(100) NOT NULL, 
	nochip VARCHAR(100) NULL, 
	photoUrl VARCHAR(100) NULL,
	photoName VARCHAR(500) NULL, 
	created_at TIMESTAMP(0) NULL,
	FOREIGN KEY (id_usuario) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);	

-- --------------------------------------------------------


DROP TABLE IF EXISTS petsVaccine;
CREATE TABLE petsVaccine (
	id BIGSERIAL PRIMARY KEY,
	pet_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    laboratory VARCHAR(100) NOT NULL,
    startDate DATE NOT NULL,
    nextDate DATE NULL,
	dose VARCHAR(50) NOT NULL,
	photoUrl VARCHAR(10000000) NULL,
	photoName VARCHAR(500) NULL,
	FOREIGN KEY (pet_id) REFERENCES mascotas(id) ON UPDATE CASCADE ON DELETE CASCADE

);


DROP TABLE IF EXISTS petsDiseaseCondition;
CREATE TABLE petsDiseaseCondition (
    id BIGSERIAL PRIMARY KEY,
	pet_id BIGINT NOT NULL,
    typeDiseaseCondition VARCHAR(100) NOT NULL,
	name VARCHAR(100) NOT NULL,
    diagnosticDate DATE NOT NULL,
	status VARCHAR(100) NOT NULL,
	description VARCHAR(200) NOT NULL,
	FOREIGN KEY (pet_id) REFERENCES mascotas(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS petsTreatment;
CREATE TABLE petsTreatment (
    id BIGSERIAL PRIMARY KEY,
	pet_id BIGINT NOT NULL,
    typeTreatment VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
	startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    frequency VARCHAR(100) NOT NULL,
	FOREIGN KEY (pet_id) REFERENCES mascotas(id) ON UPDATE CASCADE ON DELETE CASCADE
);


DROP TABLE IF EXISTS petsVeterinarian;
CREATE TABLE petsVeterinarian (
    id BIGSERIAL PRIMARY KEY,
	pet_id BIGINT NOT NULL,
    fullName VARCHAR(100) NOT NULL,
    idType VARCHAR(100) NOT NULL,
    idNumber VARCHAR(100) NOT NULL,
    phone VARCHAR(100) NOT NULL,
	city_id BIGINT NOT NULL,
    address VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
	FOREIGN KEY (pet_id) REFERENCES mascotas(id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (city_id) REFERENCES townships(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- --------------------------------------------------------

DROP TABLE IF EXISTS pacientes CASCADE;
CREATE TABLE pacientes(
	id BIGSERIAL PRIMARY KEY,
	code VARCHAR(100) NOT NULL UNIQUE,
	nombre VARCHAR(255) NOT NULL,
	apellido VARCHAR(255) NOT NULL,
	tipoID VARCHAR(80) NOT NULL,
	numeroID VARCHAR(80) NOT NULL,
	telefono VARCHAR(30) NOT NULL,
	fecha_nacimiento DATE NULL,
	genero VARCHAR(30) NOT NULL,
	ciudad VARCHAR(50) NOT NULL,
	departamento VARCHAR(50) NOT NULL,
	direccion VARCHAR(255) NOT NULL,
	rh VARCHAR(35) NOT NULL,
	eps VARCHAR(50) NULL ,
	prepagada VARCHAR(50) NULL,
	arl VARCHAR(50) NULL,
	seguro_funerario VARCHAR(50) NULL,
	a_cargo_id BIGINT NOT NULL,
	image VARCHAR(255) NULL,
	enterprise VARCHAR(255) NULL, --
	nit VARCHAR(255) NULL, --
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (a_cargo_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS enfermedades CASCADE;
CREATE TABLE enfermedades(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,
	enfermedad VARCHAR(200)  NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE

);



DROP TABLE IF EXISTS condicion CASCADE;
CREATE TABLE condicion(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,	
	discapacidad VARCHAR(100) NULL,
	embarazada VARCHAR(10) NULL,
	cicatrices_descripcion VARCHAR(1000) NULL,
	tatuajes_descripcion VARCHAR(1000) NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS antecedentes;
CREATE TABLE antecedentes(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,
	tipo_antecedente VARCHAR(50) NULL,
	descripcion_antecedente VARCHAR(1000) NULL,
	fecha_antecedente DATE NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE
);


DROP TABLE IF EXISTS atecedentes_familiares;
CREATE TABLE atecedentes_familiares(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,
	tipo_antecedente VARCHAR(50) NULL,
	parentesco VARCHAR(100) NULL,
	descripcion_antecedente VARCHAR(1000) NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS medicamentos;
CREATE TABLE medicamentos(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,
	medicamento VARCHAR(100) NULL,
	laboratorio VARCHAR(100) NULL,
	formula VARCHAR(255) NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS alergias;
CREATE TABLE alergias(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,
	tipo_alergia VARCHAR(100) NULL,
	descripcion VARCHAR(1000) NULL,
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP TABLE IF EXISTS vacunas;
CREATE TABLE vacunas(
	id BIGSERIAL PRIMARY KEY,
	id_paciente BIGINT NOT NULL,
	vacuna VARCHAR(100) NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	created_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_paciente) REFERENCES pacientes(id) ON UPDATE CASCADE ON DELETE CASCADE
);


DROP TABLE IF EXISTS contactos;
CREATE TABLE contactos(
	id BIGSERIAL PRIMARY KEY,
	id_usuario BIGINT NOT NULL,
	nombre1 character varying(100),
    telefono1 character varying(50),
    nombre2 character varying(100),
    telefono2 character varying(50),
    nombre3 character varying(100),
    telefono3 character varying(50),
	created_at TIMESTAMP(0) NOT NULL,
	updated_at TIMESTAMP(0) NOT NULL,
	FOREIGN KEY (id_usuario) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);



DROP TABLE IF EXISTS personal_salud;
CREATE TABLE personal_salud(
	id BIGSERIAL PRIMARY KEY,
	tipoID VARCHAR(80) NOT NULL,
	numeroID VARCHAR(80) NOT NULL,
    primer_nombre VARCHAR(255) NOT NULL,
	primer_apellido VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS ingreso_salud;
CREATE TABLE ingreso_salud(
	id BIGSERIAL PRIMARY KEY,
	nombres VARCHAR(80) NOT NULL,
	numeroID VARCHAR(80) NOT NULL,
	hora_ingreso TIMESTAMP(0) NOT NULL
);	

	