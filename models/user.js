const db = require("../config/config");
const crypto = require("crypto");
const { oneOrNone } = require("../config/config");

const User = {};

//evnair emails
const transporter = require("../config/mailer");
var handlebars = require("handlebars");
var fs = require("fs");

User.changePassword = (data) => {
  const sql = `
  UPDATE
      users
  SET 
    password = $2
  WHERE
      id = $1
`;
  return db.none(sql, [data.id, data.password]);
};

User.getUserById = (id) => {
  const sql = `
  SELECT 
  u.id,
  u.name,
  u.lastname,
  u.typeid,
  u.numberid,
  u.address,
u.city_id,
u.phone,

  d.id as department
FROM
  users as u
INNER JOIN townships AS t ON u.city_id = t.id
INNER JOIN departments AS d ON t.department_id = d.id
WHERE 
u.id = $1`;
  return db.oneOrNone(sql, id);
};

User.updateUser = (data) => {
  const sql = `
    UPDATE
        users
    SET 
        name = $2,
        lastname = $3,
        typeid = $4,
        numberid = $5,
        address = $6,
        city_id  = $7,
        phone = $8
    WHERE
        id = $1
  `;
  return db.none(sql, [
    data.id,
    data.name,
    data.lastname,
    data.typeid,
    data.numberid,
    data.address,
    data.city_id,
    data.phone,
  ]);
};

User.getPetnUser = (hashcode) => {
  const sql = `
    SELECT 
          m.*,
          users.name,
          users.lastname,
          users.phone
    FROM
          mascotas m
    JOIN users ON m.hashcode = users.hashcode
    WHERE 
    users.hashcode = $1 AND m.hashcode = $1`;

  return db.manyOrNone(sql, hashcode);
};

User.getAll = () => {
  const sql = `
    SELECT 
        * 
    FROM
        users
    `;

  return db.manyOrNone(sql);
};

User.getAllDepartments = () => {
  const sql = `
    SELECT
        id, 
        name
    FROM
        departments
    `;

  return db.manyOrNone(sql);
};

User.getTownshipsDepartment = (id) => {
  const sql = `
    SELECT
        id, 
        name
    FROM
    townships

    WHERE department_id = $1
    `;

  return db.manyOrNone(sql, id);
};

User.hashcode = (hashcode) => {
  const sql = `SELECT c.license
    FROM users u, codes c
    WHERE c.hashcode = $1
    GROUP BY c.license`;
  return db.oneOrNone(sql, hashcode);
};

User.findbyId = (id, callback) => {
  const sql = `
    SELECT 
        id,
        name,
        lastname,
        typeID,
        numberID,
        phone,
        email,
        password,
        session_token
    FROM
        users
    WHERE
        id = $1
    `;
  return db.oneOrNone(sql, id).then((user) => {
    callback(null, user);
  });
};

User.findOneUserById = (id) => {
  const sql = `
    SELECT 
        id,
        name,
        lastname,
        typeID,
        numberID,
        phone,
        email,
        password,
        session_token
    FROM
        users
    WHERE
        id = $1
    `;
  return db.oneOrNone(sql, id);
};

User.findUserByHashcode = (hashcode) => {
  const sql = `
    SELECT 
        name,
        lastname,
        phone
    FROM
        users
    WHERE
        hashcode = $1
    `;
  return db.oneOrNone(sql, hashcode);
};

User.findOne = (session_token, callback) => {
  const sql = `
    SELECT 
        id,
        name,
        lastname,
        typeID,
        numberID,
        phone,
        email,
        password,
        session_token
    FROM
        users
    WHERE
        session_token = $1
    `;
  return db.oneOrNone(sql, id).then((user) => {
    callback(null, user);
  });
};

User.updatePassword = (id, hashedPassword) => {
  const sql = `
    UPDATE
        users
    SET 
        password = $1
    WHERE
        id = $2
  `;
  return db.none(sql, [hashedPassword, id]);
};

User.findByEmail = (email) => {
  const sql = `
    SELECT
        id,
        hashcode,
        name,
        lastname,
        typeID,
        numberID,
        phone,
        email,
        password,
        verificado
    FROM
        users
    WHERE
        email = $1    
    `;
  return db.oneOrNone(sql, email);
};

User.confirmEmail = (idUser) => {
  const sql = `
    UPDATE
        users
    SET
        verificado = true
    WHERE
        id = $1
    `;
  return db.none(sql, idUser);
};

User.create = (user) => {
  const myPasswordHashed = crypto
    .createHash("md5")
    .update(user.password)
    .digest("hex");
  user.password = myPasswordHashed;

  const sql = `
    INSERT INTO 
        users(
            code,
            name,
            lastname,
            typeID,
            numberID,
            phone,
            email,
            parentesco,
            password,
            city_id,
            address,
            verificado,
            created_at,
            updated_at
        )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id
    `;
  return db.oneOrNone(sql, [
    user.code || null,
    user.name,
    user.lastname,
    user.typeID,
    user.numberID,
    user.phone,
    user.email,
    user.parentesco,
    user.password,
    user.city_id,
    user.address,
    false,
    new Date(),
    new Date(),
  ]);
};

User.updateHashCode = (hashcode, code) => {
  const sql = `
        UPDATE
            users
        SET 
            hashcode = $1
        WHERE
            code = $2
    `;
  return db.none(sql, [hashcode, code]);
};

User.deleteUser = (user_email) => {
  const sql = `
    DELETE FROM 
        users
    WHERE
        email = $1
    `;
  return db.none(sql, user_email);
};

User.createForm1 = (user) => {
  const sql = `
    INSERT INTO 
        pacientes(
            code,
            nombre,
            apellido,
            tipoID,
            numeroID,
            telefono,
            fecha_nacimiento,
            genero,
            ciudad,
            departamento,
            direccion,
            rh,
            eps,
            prepagada,
            arl,
            seguro_funerario,
            a_cargo_id,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING id
    `;

  return db.oneOrNone(sql, [
    user.code,
    user.nombre,
    user.apellido,
    user.tipoID,
    user.numeroID,
    user.telefono,
    user.fechaNacimiento,
    user.genero,
    user.ciudad,
    user.departamento,
    user.direccion,
    user.rh,
    user.eps,
    user.prepagada,
    user.arl,
    user.seguroFunerario,
    user.aCargoId,
    new Date(),
    new Date(),
  ]);
};

User.getAllPersons = (id) => {
  const sql = `
  SELECT c.agreement, p.code, p.nombre, p.photourl, p.fecha_nacimiento, p.genero
  FROM codes c
  JOIN pacientes p ON c.hashcode = p.code
  WHERE p.a_cargo_id = $1;`;

  return db.manyOrNone(sql, id);
};

User.savePhotoUrl = (data) => {
  const sql = `UPDATE pacientes SET photourl = $2
  WHERE id = $1;
  `;
  return db.oneOrNone(sql, [data.id, data.photoUrl]);
};

User.findPacientById = (id) => {
  const sql = `
    SELECT 
        id,
        photourl
    FROM
        pacientes
    WHERE
        id = $1
    `;
  return db.oneOrNone(sql, id);
};

User.personByHashcode = (id) => {
  const sql = `
    SELECT
		*
    FROM 
        pacientes 
    WHERE 
        code = $1
        `;

  return db.oneOrNone(sql, id);
};

User.getOneQr = () => {
  const sql = `SELECT c.hashcode
  FROM codes c
  LEFT JOIN pacientes m ON c.hashcode = m.code
  WHERE m.code IS NULL and c.license = 'Health' and c.agreement IS NULL
  LIMIT 1;
  `;
  return db.oneOrNone(sql);
};

User.createFormEnfermedad = (idPaciente, enfermedad) => {
  const sql = `
    INSERT INTO 
        enfermedades(
            id_paciente,
            enfermedad,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4)
    `;

  return db.oneOrNone(sql, [idPaciente, enfermedad, new Date(), new Date()]);
};

User.createForm2 = (info) => {
  const sql = `
    INSERT INTO 
        condicion(
            id_paciente,
            discapacidad,
            embarazada,
            cicatrices_descripcion,
            tatuajes_descripcion,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5, $6, $7)
    `;

  return db.oneOrNone(sql, [
    info.idPaciente,
    info.discapacidad,
    info.embarazada,
    info.cicatricesDescripcion,
    info.tatuajesDescripcion,
    new Date(),
    new Date(),
  ]);
};

User.createForm3 = (info) => {
  const sql = `
    INSERT INTO 
        antecedentes(
            id_paciente,
            tipo_antecedente,
            descripcion_antecedente,
            fecha_antecedente,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5, $6)
    `;

  return db.oneOrNone(sql, [
    info.idPaciente,
    info.tipoAntecedente,
    info.descripcionAntecedente,
    info.fechaAntecedente,
    new Date(),
    new Date(),
  ]);
};

User.createForm6 = (info) => {
  const sql = `
    INSERT INTO 
        atecedentes_familiares(
            id_paciente,
            tipo_antecedente,
            parentesco,
            descripcion_antecedente,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5, $6)
    `;

  return db.oneOrNone(sql, [
    info.idPaciente,
    info.tipoAntecedenteF,
    info.parentescoF,
    info.descripcionAntecedenteF,
    new Date(),
    new Date(),
  ]);
};

User.createForm4 = (info) => {
  const sql = `
    INSERT INTO 
        medicamentos(
            id_paciente,
            medicamento,
            laboratorio,
            formula,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5, $6);
    `;

  return db.oneOrNone(sql, [
    info.idPaciente,
    info.medicamento,
    info.laboratorio,
    info.formula,
    new Date(),
    new Date(),
  ]);
};

User.createForm5 = (info) => {
  const sql = `
    INSERT INTO 
         alergias(
            id_paciente,
            tipo_alergia,
            descripcion,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5)
    `;

  return db.oneOrNone(sql, [
    info.idPaciente,
    info.tipoAlergia,
    info.descripcion,
    new Date(),
    new Date(),
  ]);
};

User.createFormVacunas = (info) => {
  const sql = `
    INSERT INTO 
         vacunas(
            id_paciente,
            vacuna,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4)
    `;

  return db.oneOrNone(sql, [
    info.idPaciente,
    info.vacuna,
    new Date(),
    new Date(),
  ]);
};

User.createObject = (info) => {
  const sql = `
    INSERT INTO 
         pertenencias(
            id_user,
            hashcode,
            objeto,
            descripcion,
            created_at
        )   
    VALUES($1, $2, $3, $4, $5) RETURNING id
    `;

  return db.oneOrNone(sql, [
    info.idUsuario,
    info.hashcode,
    info.nombreObjeto,
    info.descObjeto,
    new Date(),
  ]);
};

User.deleteObject = (hashcode, objecto) => {
  sql = `
    DELETE FROM
        pertenencias
    WHERE
        hashcode = $1 AND objeto = $2
    `;

  return db.none(sql, [hashcode, objecto]);
};

User.createContact = (info) => {
  const sql = `
    INSERT INTO 
         contactos(
            id_usuario,
            nombre1,
            telefono1,
            nombre2,
            telefono2,
            nombre3,
            telefono3,
            created_at,
            updated_at
        )   
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `;

  return db.oneOrNone(sql, [
    info.idUsuario,
    info.nombre1,
    info.telefono1,
    info.nombre2,
    info.telefono2,
    info.nombre3,
    info.telefono3,
    new Date(),
    new Date(),
  ]);
};

User.updateContact = (info) => {
  const sql = `
    UPDATE 
        contactos
    SET
		nombre1 = $2,
        telefono1 = $3,
        nombre2 = $4,
        telefono2 = $5,
        nombre3 = $6,
        telefono3 = $7,
        updated_at = $8
    WHERE 
        id_usuario = $1
        `;

  return db.none(sql, [
    info.idUsuario,
    info.nombre1,
    info.telefono1,
    info.nombre2,
    info.telefono2,
    info.nombre3,
    info.telefono3,
    new Date(),
  ]);
};

User.findByCod = (cod) => {
  const sql = `
    SELECT
    a_cargo_id, 
        pacientes.id, 
        nombre as "nombre",
        apellido as "apellido",
        tipoid as "Tipo de identificación",
        numeroid as "Número de identificación",
        telefono as "telefono",
        fecha_nacimiento as "fechaNacimiento",
        genero as "genero",
        direccion as "direccion",
        ciudad,
        departamento,
        rh,
        eps,
        prepagada,
        arl,
        seguro_funerario as "Seguro funerario",
        parentesco,
        photourl,
        c.nombre1 as "Nombre del Contacto",
		c.telefono1 as "Teléfono del Contacto"
    FROM 
        pacientes
    LEFT JOIN users ON pacientes.a_cargo_id = users.id
    INNER JOIN contactos as c ON users.id = c.id_usuario
    WHERE 
        pacientes.code = $1
        `;
  return db.manyOrNone(sql, cod);

  // name as "Nombre del contacto",
  // parentesco,
  // phone as "Teléfono del contacto"

  // id,
  // nombre AS "nombres",
  // apellido AS "apellidos",
  // edad,
  // genero AS Género,
  // ciudad,
  // departamento,
  // direccion,
  // rh,
  // eps,
  // prepagada,
  // arl,
  // seguro_funerario AS "Seguro funerario"
};

User.findContactsById = (id_usuario) => {
  const sql = `
    SELECT 
		nombre1,
        telefono1,
        nombre2,
        telefono2,
        nombre3,
        telefono3
    FROM 
        contactos 
    WHERE 
        id_usuario = $1
        `;

  return db.oneOrNone(sql, id_usuario);
};

// Contacto principal

User.findMainContactById = (id_usuario) => {
  const sql = `
    SELECT 
		nombre1,
        telefono1,
    FROM 
        contactos 
    WHERE 
        id_usuario = $1
        `;

  return db.oneOrNone(sql, id_usuario);
};

User.findMascotaById = (id_usuario) => {
  const sql = `
    SELECT
		*
    FROM 
        mascotas 
    WHERE 
        id_usuario = $1
        `;

  return db.oneOrNone(sql, id_usuario);
};

User.findObjectsByHashcode = (hashcode) => {
  const sql = `
    SELECT 
		objeto,
        descripcion
    FROM 
        pertenencias 
    WHERE 
        hashcode = $1
        `;

  return db.manyOrNone(sql, hashcode);
};

User.findMascotaByHashcode = (hashcode) => {
  const sql = `
    SELECT 
		    nombre,
        especie,
        raza,
        peso,
        sexo,
        fechaNacimiento,
        descripcion,
        photoUrl,
        photoName
    FROM 
        mascotas 
    WHERE 
        hashcode = $1
        `;

  return db.oneOrNone(sql, hashcode);
};

User.existsPetByHashcode = (hashcode) => {
  const sql = `
    SELECT 
		    nombre
    FROM 
        mascotas 
    WHERE 
        hashcode = $1
        `;

  return db.oneOrNone(sql, hashcode);
};

User.findCondById = (id_paciente) => {
  const sql = `
    SELECT 
		discapacidad,
		embarazada,
		cicatrices_descripcion AS "cicatrices",
		tatuajes_descripcion AS "tatuajes"
    FROM 
        condicion 
    WHERE 
        id_paciente = $1
        `;

  return db.manyOrNone(sql, id_paciente);
};

User.findEnfById = (id_paciente) => {
  const sql = `
    SELECT 
		enfermedad
    FROM 
        enfermedades 
    WHERE 
        id_paciente = $1
        `;

  return db.manyOrNone(sql, id_paciente);
};

User.findAntById = (id_paciente) => {
  const sql = `
    SELECT 
        tipo_antecedente as "tipoAntecedente",
        descripcion_antecedente as "descripcionAntecedente",
        TO_CHAR(fecha_antecedente :: DATE, 'yyyy-mm-dd') as "fechaAntecedente"

        
    FROM 
        antecedentes 
    WHERE 
        id_paciente = $1
        `;
  return db.manyOrNone(sql, id_paciente);
};

User.findAntFById = (id_paciente) => {
  const sql = `
    SELECT 
        tipo_antecedente as "tipoAntecedenteF",
        parentesco as "parentescoF",
        descripcion_antecedente as "descripcionAntecedenteF"
    FROM 
        atecedentes_familiares
    WHERE 
        id_paciente = $1
        `;
  return db.manyOrNone(sql, id_paciente);
};

User.findMedById = (id_paciente) => {
  const sql = `
    SELECT 
        medicamento,
        laboratorio,
        formula AS "Dosis"
    FROM 
        medicamentos 
    WHERE 
        id_paciente = $1
        `;
  return db.manyOrNone(sql, id_paciente);
};

User.findAlerById = (id_paciente) => {
  const sql = `
    SELECT 
        tipo_alergia AS "tipoAlergia",
        descripcion
    FROM 
        alergias 
    WHERE 
        id_paciente = $1
        `;
  return db.manyOrNone(sql, id_paciente);
};

User.findVacunasById = (id_paciente) => {
  const sql = `
    SELECT 
        vacuna
    FROM 
        vacunas
    WHERE 
        id_paciente = $1
        `;
  return db.manyOrNone(sql, id_paciente);
};

User.updateToken = (id, token) => {
  const sql = `
    UPDATE  
        users
    SET
        session_token = $2
    WHERE
        id = $1
    `;

  return db.none(sql, [id, token]);
};

User.updateNotificationID = (id, notificationID) => {
  const sql = `
    UPDATE  
        users
    SET
        notificationid = null
    WHERE
        notificationid = $2;
    UPDATE  
        users
    SET
        notificationid = $2
    WHERE
        id = $1
    `;
  return db.none(sql, [id, notificationID]);
};

User.isPasswordMatched = (candidatePassword, hash) => {
  const myPasswordHashed = crypto
    .createHash("md5")
    .update(candidatePassword)
    .digest("hex");
  if (myPasswordHashed === hash) {
    return true;
  }
  return false;
};

//EDICION DE LA INFORMACION POR EL CLIENTE

User.deleteInfo = (id_paciente, tabla) => {
  sql = `
    DELETE FROM
        ${tabla}
    WHERE
        id_paciente = $1
    `;
  return db.none(sql, id_paciente);
};

User.updatePaciente = (info) => {
  sql = `
    UPDATE
        pacientes
    SET
        nombre = $1,
        apellido = $2,
        tipoID = $3,
        numeroID = $4,
        telefono = $5,
        fecha_nacimiento = $6,
        genero = $7,
        ciudad = $8,
        departamento = $9,
        direccion = $10,
        rh = $11,
        eps = $12,
        prepagada = $13,
        arl = $14,
        seguro_funerario = $15,
        updated_at = $16
    WHERE
        id = $17
    `;
  return db.none(sql, [
    info.nombre,
    info.apellido,
    info.tipoID,
    info.numeroID,
    info.telefono,
    info.fecha_nacimiento,
    info.genero,
    info.ciudad,
    info.departamento,
    info.direccion,
    info.rh,
    info.eps,
    info.prepagada,
    info.arl,
    info.seguroFunerario,
    new Date(),
    info.idPaciente,
  ]);
};

User.sendEmail = async (info) => {
  let htmlToSend;

  try {
    const html = fs.readFileSync("mail/verification.html", "utf8");

    var template = handlebars.compile(html);
    var replacements = {
      username: info.user.name,
      urlToken: info.urlToken,
    };

    htmlToSend = template(replacements);

    await transporter.sendMail({
      to: info.user.email,
      subject: "¡Confirmación email Cuidame!",
      html: htmlToSend,
      attachments: [
        {
          filename: "logo_cuidame.png",
          path: "mail/assets/logo_cuidame.png",
          cid: "logo_cuidame",
        },
      ],

      // html: `Hola ${user.name} Gracias por adquserruirir nuestros servicios, por favor para confirmar tu email haz click en el siguiente enlace: <a href="${url}">${url}</a><br><p>Este enlace expira pasadas 24 horas, en ese caso por favor inicie sesión para recibir un nuevo correo de verificación.</p>`,
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// ------------------------------- PETS ---------------------------------

User.findMascotaById = (id_usuario) => {
  const sql = `
      SELECT
          *
      FROM 
          mascotas 
      WHERE 
          id_usuario = $1
          `;

  return db.oneOrNone(sql, id_usuario);
};

User.findMascotaByHashcode = (hashcode) => {
  const sql = `
      SELECT 
          *
      FROM 
          mascotas 
      WHERE 
          hashcode = $1
          `;

  return db.oneOrNone(sql, hashcode);
};

User.findPetVaccineById = (hashcode) => {
  const sql = `
  SELECT
      name,
      laboratory,
      vaccineDate,
      photoBs64
  FROM 
    petsVaccine 
  WHERE 
      hashcode = $1
      `;

  return db.oneOrNone(sql, hashcode);
};

User.findDewormerById = (hashcode) => {
  const sql = `
  SELECT
      name,
      laboratory,
      dewormerDate
  FROM 
    petsDewormer 
  WHERE 
      hashcode = $1
      `;

  return db.oneOrNone(sql, hashcode);
};

User.findDiseaseById = (hashcode) => {
  const sql = `
  SELECT
      diagnostic,
      diagnosticDate
  FROM 
    petsDisease 
  WHERE 
      hashcode = $1
      `;

  return db.oneOrNone(sql, hashcode);
};

User.findSpecialConditionById = (hashcode) => {
  const sql = `
  SELECT
      type,
      specialConditionDate,
      description
  FROM 
    specialCondition 
  WHERE 
      hashcode = $1
      `;

  return db.oneOrNone(sql, hashcode);
};

User.findVeterinarianById = (hashcode) => {
  const sql = `
  SELECT
      type,
      fullName,
      phone,
      description,
      email
  FROM 
    petVeterinarian 
  WHERE 
      hashcode = $1
      `;

  return db.oneOrNone(sql, hashcode);
};

User.createMascota = (info) => {
  const sql = `
      INSERT INTO 
           mascotas(
              id_usuario,
              hashcode,
              nombre,
              especie,
              raza,
              peso,
              sexo,
              fechanacimiento,
              descripcion,
              seguro,
              estatura,
              temperamento,
              nochip,
              photoUrl,
              photoName,
              created_at
          )   
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;

  return db.oneOrNone(sql, [
    info.id_usuario,
    info.hashcode,
    info.nombre,
    info.especie,
    info.raza,
    info.peso,
    info.sexo,
    info.fechanacimiento,
    info.descripcion,
    info.seguro,
    info.estatura,
    info.temperamento,
    info.nochip,
    info.photoUrl,
    info.photoName,
    new Date(),
  ]);
};

User.savePetImg = (info) => {
  const sql = `
      INSERT INTO 
           mascotas(
              id_usuario,
              photoUrl,
              photoName,
          )   
      VALUES($1, $2, $3)
      `;

  return db.oneOrNone(sql, [info.id_usuario, info.photoUrl, info.photoName]);
};

User.updatePet = (info) => {
  const sql = `
      UPDATE 
          mascotas
      SET
          nombre = $2,
          especie = $3,
          raza = $4,
          peso = $5,
          sexo = $6,
          fechanacimiento = $7,
          descripcion = $8,
          seguro = $9,
          estatura = $10,
          temperamento = $11,
          nochip = $12,
          photourl = $13,
          photoname = $14
      WHERE 
          id_usuario = $1
          `;

  return db.none(sql, [
    info.id_usuario,
    info.nombre,
    info.especie,
    info.raza,
    info.peso,
    info.sexo,
    info.fechanacimiento,
    info.descripcion,
    info.seguro,
    info.estatura,
    info.temperamento,
    info.nochip,
    info.photourl,
    info.photoname,
    new Date(),
  ]);
};

User.updatePetVaccine = (info) => {
  const sql = `UPDATE 
    petsvaccine 
      SET 
        name = $2,
        laboratory = $3,
        photoBs64 = $4,
        photoName = $5,
        vaccineDate = $6
      WHERE 
        hashcode = $1
      `;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.name,
    info.laboratory,
    info.photoBs64,
    info.photoName,
    info.vaccineDate,
  ]);
};

User.createPetVaccine = (info) => {
  const sql = `
      INSERT INTO 
      petsVaccine (
          hashcode,
          name,
          laboratory,
          photoBs64,
          photoName,
          vaccineDate
        ) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  return db.one(sql, [
    info.hashcode,
    info.name,
    info.laboratory,
    info.photoBs64,
    info.photoName,
    info.vaccineDate,
  ]);
};

User.updatePetDewormer = (info) => {
  const sql = `UPDATE 
    petsdewormer 
      SET
        name = $2,
        laboratory = $3,
        dewormerDate = $4
      WHERE
        hashcode = $1
      `;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.name,
    info.laboratory,
    info.dewormerDate,
  ]);
};

User.createPetDewormer = (info) => {
  const sql = `
      INSERT INTO 
        petsDewormer (
          hashcode,
          name,
          laboratory,
          dewormerDate
        ) 
        VALUES ($1, $2, $3, $4) RETURNING id`;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.name,
    info.laboratory,
    info.dewormerDate,
  ]);
};

User.updatePetDisease = (info) => {
  const sql = `UPDATE 
    petsdisease 
      SET
        diagnostic = $2,
        diagnosticDate = $3
      WHERE
        hashcode = $1
      `;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.diagnostic,
    info.diagnosticDate,
  ]);
};

User.createPetDisease = (info) => {
  const sql = `
      INSERT INTO 
        petsDisease (
          hashcode,
          diagnostic,
          diagnosticDate
        ) 
        VALUES ($1, $2, $3) RETURNING id`;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.diagnostic,
    info.diagnosticDate,
  ]);
};

User.updatePetSpecialCondition = (info) => {
  const sql = `UPDATE 
  specialCondition 
      SET
        type = $2,
        specialConditionDate = $3,
        description = $4
      WHERE
      hashcode = $1 
      `;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.type,
    info.specialConditionDate,
    info.description,
  ]);
};

User.createPetSpecialCondition = (info) => {
  const sql = `
      INSERT INTO 
        specialCondition (
          hashcode,
          type,
          specialConditionDate,
          description
        ) 
        VALUES ($1, $2, $3, $4) RETURNING id`;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.type,
    info.specialConditionDate,
    info.description,
  ]);
};

User.updatePetVeterinarian = (info) => {
  const sql = `UPDATE 
    petveterinarian 
      SET
        type = $2,
        fullname = $3,
        phone = $4,
        description = $5,
        email = $6
      WHERE
        hashcode = $1
      `;
  return db.oneOrNone(sql, [
    info.type,
    info.fullName,
    info.phone,
    info.description,
    info.email,
  ]);
};

User.createPetVeterinarian = (info) => {
  const sql = `
      INSERT INTO 
        petVeterinarian (
          hashcode,
          type,
          fullName,
          phone,
          description,
          email
        ) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
  return db.oneOrNone(sql, [
    info.hashcode,
    info.type,
    info.fullName,
    info.phone,
    info.description,
    info.email,
  ]);
};

module.exports = User;
