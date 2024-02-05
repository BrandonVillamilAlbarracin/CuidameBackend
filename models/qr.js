const db = require("../config/config");

const Qr = {};

Qr.getAgreements = () => {
  const sql = `
    select agreement 
    from codes 
    where license = 'Health' 
    AND agreement IS NOT NULL 
    GROUP BY agreement;
      `;

  return db.manyOrNone(sql);
};

Qr.addQrCode = (code, hashcode, license, agreement) => {
  const sql = `
        INSERT INTO
            codes(
                code,
                hashcode,
                license,
                agreement,
                created_at
            )
        VALUES($1, $2, $3, $4, $5) RETURNING id
    `;
  return db.oneOrNone(sql, [code, hashcode, license, agreement, new Date()]);
};

Qr.findPacientByCode = (code) => {
  const sql = `
        SELECT
            nombre,
            code
        FROM
            pacientes
        WHERE
            code=$1
    `;
  return db.oneOrNone(sql, code);
};

Qr.findMascotaByCode = (hashcode) => {
  const sql = `
        SELECT
            nombre,
            hashcode as "code"
        FROM
            mascotas
        WHERE
            hashcode=$1
    `;
  return db.oneOrNone(sql, hashcode);
};

Qr.findByCode = (code) => {
  const sql = `
        SELECT
            id,
            hashcode,
            name,
            lastname,
            phone,
            email,
            notificationID
        FROM
            users
        WHERE
            hashcode = $1
    `;

  return db.oneOrNone(sql, code);
};

Qr.findPetByCode = (code) => {
  const sql = `
    SELECT
    m.hashcode,
    users.id,
    users.name,
    users.lastname,
    users.phone,
    users.email,
    users.notificationID
FROM
    mascotas m
JOIN users ON m.id_usuario = users.id
WHERE 
m.hashcode = $1`;

  return db.oneOrNone(sql, code);
};

Qr.findContacts = (idUsuario) => {
  const sql = `
    SELECT
            telefono1,
            telefono2,
            telefono3
        FROM
            public.contactos
        WHERE
            id_usuario = $1
    `;
  return db.oneOrNone(sql, idUsuario);
};

Qr.findUserContact = (id) => {
  const sql = `
  SELECT
  telefono1,
  telefono2,
  telefono3
FROM
  contactos
WHERE
  id_usuario = $1
    `;
  return db.oneOrNone(sql, id);
};

module.exports = Qr;
