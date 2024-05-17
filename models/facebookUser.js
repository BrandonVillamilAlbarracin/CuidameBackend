const db = require("../config/config");

const FacebookUser = {}

FacebookUser.create = (user) => {
  const sql = `
    INSERT INTO 
        facebook_users(
            facebook_id,
            name
        )
    VALUES($1, $2) RETURNING id
    `;

  return db.oneOrNone(sql, [
    user.code,
    user.name,
  ]);
};

module.exports = FacebookUser
