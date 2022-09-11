const db = require('../db/index')
const {
  getCurrentDateTime,
  createRefreshToken,
  isRefreshTokenExpired,
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
    console.log('------------------------------------signin-START', d)
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
          message: "Invalid Password or Username!"
        });
        return
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.SECRET,
        { expiresIn: Number(process.env.JWT_EXPIRATION) }
      );
      console.log('>>><<<', token)
      const refreshToken = await createRefreshToken(user.id);

      const userData = {
        id: user.id,
        username: user.username,
        accessToken: token,
        refreshToken: refreshToken,
      }

      res.json(userData)
    } catch (e) {
      const anotherMessage = e?.message ?? 'Unknow server error at signin controller'
      console.error(anotherMessage)
      res.status(500).send({ message: anotherMessage })
    }
    console.log('------------------------------------signin-END', d)
  }

  async refreshToken(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------refreshToken-START', d)
    try {
      const { refreshToken: requestToken } = req.body;
      console.log('requestToken', requestToken)

      if (requestToken == null) {
        return res.status(403).json({ message: "Refresh Token is required!" });
      }


      // let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
      let user = await db.query(`SELECT * FROM users WHERE refresh_token = $1`, [requestToken])
      user = user.rows[0]

      if (!user) {
        res.status(403).json({ message: "Refresh token is not in database!" });
        return;
      }

      if (isRefreshTokenExpired(user.expiry_date)) {
        // RefreshToken.destroy({ where: { id: refreshToken.id } });
        const updatedUser = await db.query(`
          UPDATE
            users
          SET
            refresh_token = $1,
            expiry_date = $2
          WHERE
            id = $3
          RETURNING *`,
          [null, null, user.id]
        )

        res.status(403).json({
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }

      // const user = await refreshToken.getUser();
      const newAccessToken = jwt.sign(
        { id: user.id },
        process.env.SECRET,
        { expiresIn: process.env.JWT_EXPIRATION, }
      );

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: user.refresh_token,
      });
    } catch (e) {
      const anotherMessage = e?.message ?? 'Unknow server error at refreshToken controller'
      res.status(500).send({ message: anotherMessage })
      console.error(anotherMessage)
    }
    console.log('------------------------------------refreshToken-END', d)
  }

  async logout(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------logout-START', d)
    try {
      const { userId } = req.body
      // remove refresh_token and expiry_date
      console.log('logout', userId)
      res.json({
        message: "done",
      });
      return;
    } catch (e) {
      const anotherMessage = e?.message ?? `Unknow server error at ${AuthController.name} - logout`
      res.status(500).send({ message: anotherMessage })
      console.error(anotherMessage)
    }
    console.log('------------------------------------logout-END', d)
  }

}

module.exports = new AuthController()