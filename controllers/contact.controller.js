const db = require('../db/index')
const {
  getCurrentDateTime
} = require('../global/helper')
const dbKey = 'contact';

class ContactController {
  async createContact(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------createContact-START', d)
    const { phone, email, facebook, instagram, telegram, vimeo } = req.body
    const contact = JSON.stringify({ phone, email, facebook, instagram, telegram, vimeo })
    const newContact = await db.query(`INSERT INTO general (name, data) values ($1, $2) RETURNING *`, [dbKey, contact])
    res.json(newContact.rows)
    console.log('------------------------------------createContact-END', d)
  }

  async getContact(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------getContact-START', d)
    const contact = await db.query(`SELECT * FROM general WHERE name = $1`, [dbKey])
    const cnt = contact.rows ? contact.rows[0].data : null
    res.json(cnt ? JSON.parse(cnt) : cnt)
    console.log('------------------------------------getContact-END', d)
  }

  async updateContact(req, res) {
    const d = getCurrentDateTime()
    console.log('------------------------------------updateContact-START', d)
    const { phone, email, facebook, instagram, telegram, vimeo } = req.body
    const updatedContact = JSON.stringify({ phone, email, facebook, instagram, telegram, vimeo })
    const contact = await db.query(`UPDATE general SET name = $1, data = $2 RETURNING *`, [dbKey, updatedContact])
    res.json(contact.rows)
    console.log('------------------------------------updateContact-END', d)
  }
}

module.exports = new ContactController()