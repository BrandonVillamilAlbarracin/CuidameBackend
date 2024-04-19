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

module.exports = MicrosoftUser
