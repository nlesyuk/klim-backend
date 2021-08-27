const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
require('dotenv').config({ path: __dirname + '/.env' })

const PORT = process.env.PORT || 8091;

const { getCategory } = require('./global/helper')
const constants = require('./global/constants')
const workRoutes = require('./routes/work.route')
const contactRoutes = require('./routes/contact.route')
const imagesRoutes = require('./routes/images.route')

const storageConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log('--')
    const author = req.headers.author

    if (author) {
      const category = getCategory(req.originalUrl, constants.categories)

      if (category) {
        // const dest = path.resolve(`./public/uploads/${author}/${category}`)
        const dest = `./public/uploads/${author}/${category}`
        fs.access(dest, function (error) {
          if (error) {
            console.error("Directory does not exist.");
            return fs.mkdir(dest, (error) => callback(error, dest));
          } else {
            console.warn("Directory exists.");
            return callback(null, dest);
          }
        });
      } else {
        // обробити помилку
        console.log('FILE UPLOADING ERROR')
      }
    }
    // how save path to image in DB
    // https://stackoverflow.com/questions/46975942/how-to-send-image-name-in-database-using-multer-and-express/47560629
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}_${req.headers.author}_${file.originalname}`);
  }
});

const corsConfig = {
  // origin: 'http://localhost:8080',
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

// plugins:
app.use(cors(corsConfig))
app.use(multer({ storage: storageConfig }).any());
app.use(express.json())
// routes:
app.use('/api', workRoutes)
app.use('/api', contactRoutes)
app.use('/public', imagesRoutes)
// routes error handler
app.use((req, res, next) => {
  res.status(404).send({ message: "Not Found" });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))