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

FacebookUser.findByID=(id)=>{
  const sql = `
    SELECT * FROM facebook_users WHERE facebook_id = $1
    `;

  return db.oneOrNone(sql, [id]);
}

module.exports = FacebookUser
