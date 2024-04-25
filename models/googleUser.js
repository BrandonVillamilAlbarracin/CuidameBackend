const db = require("../config/config");

const GoogleUser = {}

GoogletUser.create = (user) => {
  const sql = `
    INSERT INTO 
        google_users(
            google_id,
            name
        )
    VALUES($1, $2) RETURNING id
    `;

  return db.oneOrNone(sql, [
    user.code,
    user.name,
  ]);
};

module.exports = GoogleUser
