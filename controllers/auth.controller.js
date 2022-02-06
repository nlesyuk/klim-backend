const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

class Auth {
  async login(req, res) {
    const { username, password } = req.body;
    const candidate = await User.findOne(username);

    if (candidate) {
      // user exists
      const passwordResult = await bcrypt.compareSync(password, candidate?.password);
      if (passwordResult) {
        // generate token
        const token = jwt.sign({
          username: candidate.username,
          userId: candidate._id,
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
          token,
        })
      } else {
        // password is incorrect
        res.status(401).json({
          message: 'username or password is incorrect',
        })
      }
    } else {
      // user does not exist
      res.status(404).json({
        message: 'username or password is incorrect',
      })
    }
  }

  async register(req, res) {
    try {
      const { username, password } = req.body;
      if (!username) {
        throw new Error('username is required')
      }
      if (!password) {
        throw new Error('password is required')
      }

      // check if user exists
      const candidate = await User.findOne(username);
      if (candidate) {
        res.status(409).json({ message: `register ${username} is exist` });
      } else {
        // create user
        const salt = bcrypt.genSaltSync(10);
        const user = await User.create({
          username,
          password: bcrypt.hashSync(password, salt)
        });
        res.status(201).json({ message: `register ${username} success`, user, });
      }
    } catch (error) {
      console.error(error)
      res.status(400).json({ message: error.message })
    }
  }
}

module.exports = new Auth();
