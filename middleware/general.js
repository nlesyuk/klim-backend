const db = require('../db/')
const { getUserIdByDomain } = require('../global/helper')

async function checkUserExisting(req, res, next) {
  try {
    // const reqDomain = req.get('host')
    // const headerDomain = req?.headers?.domain
    // console.log('>>', reqDomain, headerDomain)
    // if (reqDomain != headerDomain) {
    //   throw new Error(`Something wrong with domain`)
    // }
    // const userId = getUserIdByDomain(reqDomain)

    const userId = req?.headers?.userid
    console.log('--', req?.headers)

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
    res.status(500).send({ message: error.message })
  }
};

module.exports = {
  checkUserExisting
};