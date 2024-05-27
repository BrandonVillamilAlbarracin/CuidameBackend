const db = require("../config/config");

const MicrosoftUser = {}

MicrosoftUser.create = (user) => {
  const sql = `
    INSERT INTO 
        microsoft_users(
            microsoft_id,
            name
        )
    VALUES($1, $2) RETURNING id
    `;

  return db.oneOrNone(sql, [
    user.code,
    user.name,
  ]);
};

MicrosoftUser.findUserByID = (id) => {
  const sql = `
    SELECT * FROM microsoft_users WHERE microsoft_id = $1
    `;

  return db.oneOrNone(sql, [id]);
}

module.exports = MicrosoftUser
