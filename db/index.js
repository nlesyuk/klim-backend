const Pool = require('pg').Pool

const pool = new Pool({
  user: 'nazar',
  password: 'nazar',
  host: 'localhost',
  port: 5432,
  database: 'klim'
})

module.exports = pool