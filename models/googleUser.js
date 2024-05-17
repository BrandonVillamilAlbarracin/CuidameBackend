const db = require("../config/config");

const GoogleUser = {}

GoogleUser.create = (user) => {
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

GoogleUser.findByGoogleId = (id) => {
  const sql = `
    SELECT * FROM
        google_users WHERE google_id = $1 `;

  return db.oneOrNone(sql, [
    id
  ]);
};

module.exports = GoogleUser
