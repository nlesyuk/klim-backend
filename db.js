const Pool = require('pg').Pool

const pool = new Pool({
  user: 'nazar',
  password: 'nazar',
  host: 'localhost',
  port: 5432,
  database: 'express-api'
})



module.exports = pool