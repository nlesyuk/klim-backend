const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
require('dotenv').config({ path: __dirname + '/.env' })
const { renameIncomeImagePattern } = require('./global/helper')

const PORT = process.env.PORT || 8091;

const { getCategory } = require('./global/helper')
const constants = require('./global/constants')
const workRoutes = require('./routes/work.route')
const contactRoutes = require('./routes/contact.route')
const shotsRoutes = require('./routes/shots.route')
const photosRoutes = require('./routes/photos.route')
const publicRoutes = require('./routes/public.route')

const storageConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    const author = req.headers.author

    if (author) {
      const category = getCategory(req.originalUrl, constants.categories)

      console.log("CATEGORY", category, `${__dirname}/public/uploads/${author}/${category}`)
      if (category) {
        const dest = path.resolve(`${__dirname}/public/uploads/${author}/${category}`)
        // const dest = `./public/uploads/${author}/${category}`
        console.log("DEST", dest)
        fs.access(dest, (error) => {
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
    console.log('FILE', file)
    let filename = `${file.originalname}`.replace(renameIncomeImagePattern, '') // remove special character from str
    if (!filename.length) {
      filename = `image_${Date.now()}`;
    }
    filename = `${Date.now()}_${req.headers.author}_${filename}`
    callback(null, filename);
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
app.use('/api', shotsRoutes)
app.use('/api', photosRoutes)

app.use('/public', publicRoutes)
// routes error handler
app.use((req, res, next) => {
  res.status(404).send({ message: "Not Found" });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))