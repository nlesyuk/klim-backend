const db = require('../db/index')

const dbKey = 'contact';

class ContactController {
  async createContact(req, res) {
    const { phone, email, facebook, instagram, telegram, vimeo } = req.body
    const contact = JSON.stringify({ phone, email, facebook, instagram, telegram, vimeo })
    const newContact = await db.query(`INSERT INTO general (name, data) values ($1, $2) RETURNING *`, [dbKey, contact])
    res.json(newContact.rows)
  }

  async getContact(req, res) {
    const contact = await db.query(`SELECT * FROM general WHERE name = $1`, [dbKey])
    const cnt = contact.rows ? contact.rows[0].data : null
    res.json(cnt ? JSON.parse(cnt) : cnt)
  }

  async updateContact(req, res) {
    const { phone, email, facebook, instagram, telegram, vimeo } = req.body
    const updatedContact = JSON.stringify({ phone, email, facebook, instagram, telegram, vimeo })
    const contact = await db.query(`UPDATE general SET name = $1, data = $2 RETURNING *`, [dbKey, updatedContact])
    res.json(contact.rows)
  }
}

module.exports = new ContactController()