const db = require("../../config/config");
const crypto = require("crypto");
const { oneOrNone } = require("../../config/config");

const Pet = {};

//evnair emails
const transporter = require("../../config/mailer");
var handlebars = require("handlebars");
var fs = require("fs");

Pet.getOwnerxPet = (hashcode) => {
  const sql = `SELECT u.name, u.lastname, u.phone
 FROM users u
 LEFT JOIN mascotas m ON u.id = m.id_usuario
 WHERE m.hashcode = $1`;
  return db.oneOrNone(sql, hashcode);
};

Pet.getOneQr = () => {
  const sql = `SELECT c.hashcode
  FROM codes c
  LEFT JOIN mascotas m ON c.hashcode = m.hashcode
  WHERE m.hashcode IS NULL and c.license = 'Pets' and c.agreement IS NULL and c.status = 'inactive'
  LIMIT 1;
  `;
  return db.oneOrNone(sql);
};

Pet.SetPetID = (info) => {
  const sql = `
  UPDATE
  mascotas
  SET petid = $2
  WHERE id = $1
      `;

  return db.oneOrNone(sql, [info.id, info.petid]);
};

Pet.getAllPets = (id) => {
  const sql = `
  SELECT c.agreement, m.id, m.nombre, m.photourl
  FROM codes c
  JOIN mascotas m ON c.hashcode = m.hashcode
  WHERE m.id_usuario = $1`;

  return db.manyOrNone(sql, id);
};

Pet.getPet = (id) => {
  const sql = `
      SELECT 
            *
      FROM
            mascotas 
      WHERE 
      id = $1`;

  return db.oneOrNone(sql, id);
};

Pet.getOwner = (id) => {
  const sql = `
    SELECT
        u.name,
        u.lastname,
        u.phone,
        t.name as city,
        d.name as department
    FROM users AS u
        INNER JOIN townships AS t ON u.city_id = t.id
        INNER JOIN departments AS d ON t.department_id = d.id
    WHERE u.id = $1;`;

  return db.oneOrNone(sql, id);
};

Pet.addPet = (info) => {
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
              color,
              fechanacimiento,
              descripcion,
              seguro,
              estatura,
              temperamento,
              nochip,
              photoUrl,
              photoName,
              castrated,
              created_at
          )   
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id
      `;

  return db.oneOrNone(sql, [
    info.id_usuario,
    info.hashcode,
    info.nombre,
    info.especie,
    info.raza,
    info.peso,
    info.sexo,
    info.color,
    info.fechanacimiento,
    info.descripcion,
    info.seguro,
    info.estatura,
    info.temperamento,
    info.nochip,
    info.photoUrl,
    info.photoName,
    info.castrated,
    new Date(),
  ]);
};

Pet.updatePet = (info) => {
  const sql = `
      UPDATE 
          mascotas
      SET
          nombre = $2,
          especie = $3,
          raza = $4,
          peso = $5,
          sexo = $6,
          color = $7,
          fechanacimiento = $8,
          descripcion = $9,
          seguro = $10,
          estatura = $11,
          temperamento = $12,
          nochip = $13,
          photourl = $14,
          photoname = $15,
          castrated = $16
      WHERE 
          id = $1
          `;

  return db.oneOrNone(sql, [
    info.id,
    info.nombre,
    info.especie,
    info.raza,
    info.peso,
    info.sexo,
    info.color,
    info.fechanacimiento,
    info.descripcion,
    info.seguro,
    info.estatura,
    info.temperamento,
    info.nochip,
    info.photourl,
    info.photoname,
    info.castrated,
    new Date(),
  ]);
};

Pet.petById = (id) => {
  const sql = `
    SELECT
		*
    FROM 
        mascotas 
    WHERE 
        id = $1
        `;

  return db.oneOrNone(sql, id);
};

Pet.petByHashcode = (id) => {
  const sql = `
    SELECT
		*
    FROM 
        mascotas 
    WHERE 
        hashcode = $1
        `;

  return db.oneOrNone(sql, id);
};

Pet.getHashcode = (code) => {
  const sql = `
    SELECT
		  hashcode
    FROM
        codes
    WHERE
        code = $1
        `;

  return db.oneOrNone(sql, code);
};

Pet.getAgreement = (hashcode) => {
  const sql = `SELECT c.agreement
  FROM codes c
  JOIN mascotas m ON c.hashcode = m.hashcode
  WHERE m.hashcode = $1`;

  return db.oneOrNone(sql, hashcode);
};

Pet.deletePet = (id) => {
  const sql = `
    DELETE
    FROM 
        mascotas 
    WHERE 
        id = $1
        `;

  return db.oneOrNone(sql, id);
};

module.exports = Pet;
