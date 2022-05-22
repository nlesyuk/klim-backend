const Pool = require('pg').Pool


const credentials = {
  user: parseInt(process.env.IS_PROD) ? process.env.DB_PROD_USER : process.env.DB_LOCAL_USER,
  password: parseInt(process.env.IS_PROD) ? process.env.DB_PROD_PASSWORD : process.env.DB_LOCAL_PASSWORD,
  host: parseInt(process.env.IS_PROD) ? process.env.DB_PROD_HOST : process.env.DB_LOCAL_HOST,
  port: parseInt(process.env.IS_PROD) ? process.env.DB_PROD_PORT : process.env.DB_LOCAL_PORT,
  database: parseInt(process.env.IS_PROD) ? process.env.DB_PROD_DBNAME : process.env.DB_LOCAL_DBNAME,
}

const pool = new Pool(credentials)

module.exports = pool