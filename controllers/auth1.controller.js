const db = require('../db/index')
const {
  removeDomainFromImagePath,
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
} = require('../global/helper')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const contactKey = 'auth';

class AuthController {
  async signup(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------signup-START', d)
    try {
      const { username, password } = req.body

      // 0 - check
      if (!username) {
        throw new Error(`username is reqiured`)
      }
      if (!password) {
        throw new Error(`password is reqiured`)
        // also, you can check strength of password
      }
      // checkDuplicateUsernameOrEmail
      const user = await db.query(`SELECT * FROM users WHERE username = $1`, [username])
      if (user.rows.length) {
        throw new Error(`Username ${username} is exist, please choose another username`)
      }

      // 1 - create user in DB
      const newUser = await db.query(`INSERT INTO users(username, password) VALUES ($1, $2) RETURNING *`, [username, bcrypt.hashSync(password, 8)])

      // 3 - finish
      res.json(newUser.rows[0])
    } catch (e) {
      const anotherMessage = e?.message ? e.message : 'Unknow server error at signup controller'
      res.status(500).send({ message: anotherMessage })
      console.error(anotherMessage)
    }
    console.log('------------------------------------signup-END', d)
  }

  async signin(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------signup-START', d)
    try {
      const { username, password } = req.body

      // 0 - check
      if (!username) {
        throw new Error(`username is reqiured`)
      }
      if (!password) {
        throw new Error(`password is reqiured`)
      }
      // check password
      const userRawData = await db.query(`SELECT * FROM users WHERE username = $1`, [username])
      console.log('>>>>', userRawData.rows)
      const user = userRawData.rows?.[0]
      if (!user) {
        throw new Error(`password or username is incorrect`)
      }
      const { password: userPassword } = user
      const isPasswordValid = bcrypt.compareSync(
        password,
        userPassword
      );

      if (!isPasswordValid) {
        res.status(401).json({
          accessToken: null,
          message: "Invalid Password!"
        });
        return
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      const userData = {
        id: user.id,
        username: user.username,
        accessToken: token,
      }

      res.json(userData)
    } catch (e) {
      const anotherMessage = e?.message ?? 'Unknow server error at signup controller'
      res.status(500).send({ message: anotherMessage })
      console.error(anotherMessage)
    }
    console.log('------------------------------------signup-END', d)
  }
}

module.exports = new AuthController()