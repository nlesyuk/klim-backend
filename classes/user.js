const db = require('../db/index')
const key = 'users'


class User {
  async findById(id) {
    try {
      if (!id) {
        throw new Error('user id is required')
      }

      const result = await db.query(`SELECT * FROM ${key} WHERE id = $1`, [id])
      return result?.rows[0]
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }

  async findOne(username) {
    try {
      if (!username) {
        throw new Error('username is required')
      }

      const result = await db.query(`SELECT * FROM ${key} WHERE username = $1`, [username])
      return result?.rows[0]
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }

  async create(user = {}) {
    try {
      const { username, password } = user
      if (!username) {
        throw new Error('username is required')
      }
      if (!password) {
        throw new Error('password is required')
      }

      const result = await db.query(
        `INSERT INTO ${key} (username, password) VALUES ($1, $2) RETURNING *`,
        [username, password]
      )
      return result?.rows[0]
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }
}

module.exports = new User();