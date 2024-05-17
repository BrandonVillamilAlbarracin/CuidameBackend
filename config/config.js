const promise = require("bluebird");
const options = {
  promiseLib: promise,
  query: (e) => {},
};

const pgp = require("pg-promise")(options);
const types = pgp.pg.types;
types.setTypeParser(1114, function (stringValue) {
  return stringValue;
});

const databaseConfig = {
    'host': 'localhost',
    'port': 5432,
    'database': 'cuidame_db',
    'user': 'user_brandon',
    'password': '0000'
};

// const databaseConfig = {
//     'host': 'localhost',
//     'port': 5432,
//     'database': 'esmarthealth',
//     'user': 'esmarthealth',
//     'password': 'eshp.2022'
// };

// const databaseConfig = {
//   host: "127.0.0.1",
//   port: 5432,
//   database: "db_cuidame",
//   user: "postgres",
//   password: "DataPostGF104",
// };

const db = pgp(databaseConfig);

module.exports = db;
