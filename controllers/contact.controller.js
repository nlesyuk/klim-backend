const db = require('../db/index');
const {
  prepareImagePathForDB,
  getRightPathForImage,
  removeUploadedFiles,
  getCurrentDateTime,
  getUserIdByDomain,
} = require('../global/helper');

const contactKey = 'contact';

class ContactController {
  async createContact(req, res) {
    const d = getCurrentDateTime();
    console.log('------------------------------------createContact-START', d);
    try {
      const userId = getUserIdByDomain(req.headers?.domain);
      if (Number.isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`);
      }
      const {
        phone, email, facebook, instagram, telegram, vimeo, description,
      } = req.body;
      let image;
      const { files } = req;
      console.log('FILES', files);

      // 0 - check
      if (!phone) {
        throw new Error('phone is reqiured');
      }
      if (!email) {
        throw new Error('email is reqiured');
      }
      // if (!facebook) {
      //   throw new Error('facebook is reqiured');
      // }
      // if (!instagram) {
      //   throw new Error('instagram is reqiured');
      // }
      // if (!telegram) {
      //   throw new Error('telegram is reqiured');
      // }
      // if (!vimeo) {
      //   throw new Error('vimeo is reqiured');
      // }
      if (!files?.length) {
        // throw new Error('No files')
      }

      // 1 - prepare image
      if (files?.length) {
        // prepare photos to db
        const mappedFiles = Array.from(files).map((file) => ({
          path: prepareImagePathForDB(file),
          filename: file.filename,
        }));
        console.log('FILES-INFO', mappedFiles);
        image = mappedFiles?.[0].path;
      }

      // 2 - create record
      const contact = JSON.stringify({
        phone, email, facebook, instagram, telegram, vimeo, description, image,
      });
      const newContact = await db.query(
        `
        INSERT INTO
        general
          (name, data, user_id)
        values
          ($1, $2, $3)
        RETURNING *`,
        [contactKey, contact, userId],
      );

      // 3 - finish
      res.json(newContact.rows);
    } catch (e) {
      // remove uploaded files
      const { files } = req;
      removeUploadedFiles(files);

      // response
      const anotherMessage = e?.message ? e.message : 'Unknow server error at createContact controller';
      res.status(500).send({ message: anotherMessage });
      console.error(anotherMessage);
    }
    console.log('------------------------------------createContact-END', d);
  }

  async getContact(req, res) {
    const d = getCurrentDateTime();
    console.log('------------------------------------getContact-START', d);
    try {
      const userId = getUserIdByDomain(req.headers?.domain);
      if (Number.isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`);
      }
      // 1 - get record
      const contactRaw = await db.query('SELECT * FROM general WHERE name = $1 AND user_id = $2', [contactKey, userId]);

      // 2 - prepare data
      const contactData = contactRaw?.rows?.[0]?.data; // data is a String
      if (contactData) {
        const contact = JSON.parse(contactData);
        if (contact?.image) {
          contact.image = getRightPathForImage(contact.image, userId);
        }
        const response = contact || null;

        // 3 - send response
        res.json(response);
      } else {
        // 3 - send fail response
        res.status(500).json({ message: 'Something went wrong' });
      }
    } catch (e) {
      // response
      const anotherMessage = e?.message ? e.message : 'Unknow server error at getContact controller';
      res.status(500).send({ message: anotherMessage });
      console.error(anotherMessage);
    }
    console.log('------------------------------------getContact-END', d);
  }

  async updateContact(req, res) {
    const d = getCurrentDateTime();
    console.log('------------------------------------updateContact-START', d);
    try {
      const userId = getUserIdByDomain(req.headers?.domain);
      if (Number.isNaN(userId)) {
        throw new Error(`userId should be a number got ${userId}`);
      }
      const {
        phone, email, theme, facebook, instagram, telegram, vimeo, description,
      } = req.body;
      let image;
      const { files } = req;
      console.log('FILES', files);

      // 0 - check
      if (!phone) {
        throw new Error('phone is reqiured');
      }
      if (!email) {
        throw new Error('email is reqiured');
      }
      // if (!facebook) {
      //   throw new Error('facebook is reqiured');
      // }
      // if (!instagram) {
      //   throw new Error('instagram is reqiured');
      // }
      // if (!telegram) {
      //   throw new Error('telegram is reqiured');
      // }
      // if (!vimeo) {
      //   throw new Error('vimeo is reqiured');
      // }

      // 1 - prepare image
      if (Array.isArray(files) && files?.length) {
        // prepare photos to db
        const mappedFiles = Array.from(files).map((file) => ({
          path: prepareImagePathForDB(file),
          filename: file.filename,
        }));
        image = mappedFiles?.[0].path;
      } else {
        const contactRaw = await db.query('SELECT * FROM general WHERE name = $1 AND user_id = $2', [contactKey, userId]);
        const contactData = contactRaw?.rows?.[0]?.data; // data is a String
        if (contactData) {
          const contact = JSON.parse(contactData);
          image = contact.image;
        }
      }

      // 2 - prepare data to db
      const data = {
        phone, email, theme, facebook, instagram, telegram, vimeo, description, image,
      };
      console.log('DATA', data);

      // 3 - make record to db
      const contactRaw = await db.query(
        `UPDATE
          general
        SET
          name = $1,
          data = $2
        WHERE
          user_id = $3
        RETURNING *`,
        [contactKey, JSON.stringify(data), userId],
      );

      // 4 - prepare response
      const contactData = contactRaw?.rows?.[0]?.data;
      if (contactData) {
        const contact = JSON.parse(contactData);
        if (contact?.image) {
          contact.image = getRightPathForImage(contact.image, userId);
        }
        const response = contact || null;

        // 5 - send response
        res.json(response);
      } else {
        // 5 - send fail response
        res.status(500).json({ message: 'Something went wrong' });
      }
    } catch (e) {
      // remove uploaded files
      const { files } = req;
      removeUploadedFiles(files);

      // response
      const anotherMessage = e?.message ? e.message : 'Unknow server error at createContact controller';
      res.status(500).send({ message: anotherMessage });
      console.error(anotherMessage);
    }
    console.log('------------------------------------updateContact-END', d);
  }
}

module.exports = new ContactController();
