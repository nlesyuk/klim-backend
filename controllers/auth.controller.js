// const db = require("../models");
// const config = require("../config/auth.config");
const db = require('../db/index')
const config = {
  secret: process.env.SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION
}
const { user: User, role: Role, refreshToken: RefreshToken } = db
// const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const successMessage = "User was registered successfully!"
  const { username, email, password, roles } = req.body
  const userRole = [1] // 'user' role is 1

  try {
    // Save User to Database
    const user = await User.create({
      username: username,
      email: email,
      password: bcrypt.hashSync(password, 8)
    })

    if (roles) {
      const userRoles = await Role.findAll({
        where: {
          name: {
            [Op.or]: roles
          }
        }
      })
      console.log('userRoles', userRoles)
      await user.setRoles(userRoles)
      res.send({ message: successMessage });
      return
    }


    await user.setRoles(userRole)
    res.send({ message: successMessage });
    return
  } catch (err) {
    res.status(500).send({ message: err.message });
    return
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.body.username
      }
    })

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    const token = jwt.sign(
      { id: user.id },
      config.secret,
      { expiresIn: config.jwtExpiration || 86400 }
    );
    const refreshToken = await RefreshToken.createToken(user);
    const roles = await user.getRoles()
    const authorities = roles.map(role => `ROLE_${role.name.toUpperCase()}`);
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
      refreshToken: refreshToken,
    });

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// exports.refreshToken = async (req, res) => {
//   const { refreshToken: requestToken } = req.body;
//   console.log('requestToken', requestToken)

//   if (requestToken == null) {
//     return res.status(403).json({ message: "Refresh Token is required!" });
//   }

//   try {
//     let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
//     console.log(refreshToken)

//     if (!refreshToken) {
//       res.status(403).json({ message: "Refresh token is not in database!" });
//       return;
//     }

//     if (RefreshToken.verifyExpiration(refreshToken)) {
//       RefreshToken.destroy({ where: { id: refreshToken.id } });

//       res.status(403).json({
//         message: "Refresh token was expired. Please make a new signin request",
//       });
//       return;
//     }

//     const user = await refreshToken.getUser();
//     const newAccessToken = jwt.sign(
//       { id: user.id },
//       config.secret,
//       { expiresIn: config.jwtExpiration, }
//     );

//     console.log('refreshToken>>>>', {
//       accessToken: newAccessToken,
//       refreshToken: refreshToken.token,
//     })
//     return res.status(200).json({
//       accessToken: newAccessToken,
//       refreshToken: refreshToken.token,
//     });
//   } catch (err) {
//     return res.status(500).send({ message: err });
//   }
// };
