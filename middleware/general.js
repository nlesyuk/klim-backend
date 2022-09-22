const db = require('../db/')
const { getUserIdByDomain } = require('../global/helper')

async function checkUserExisting(req, res, next) {
  // header domain and req from domain should match
  // and then check user existing for domain
  console.log('checkUserExisting')
  try {
    const headerDomain = req?.headers?.domain
    if (JSON.parse(process.env.IS_PROD)) {
      const reqDomain = req.get('host')
      console.log('>>', reqDomain, headerDomain)
      if (reqDomain != headerDomain) {
        throw new Error(`Something wrong with domain access`)
      }
    }
    const userId = getUserIdByDomain(headerDomain)

    if (isNaN(Number(userId))) {
      throw new Error(`userId doesn't exist or should be a number`)
    }

    // check for 2 users
    if (userId === 1 || userId === 2) {
      next();
      return
    }

    const user = await db.query(`SELECT * FROM users WHERE id = $1`, [userId])

    if (user.rows?.length) {
      next();
      return
    }
  } catch (error) {
    console.log('checkUserExisting Error', error.message)
    res.status(500).send({ message: error.message })
  }
};

module.exports = {
  checkUserExisting
};