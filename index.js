const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
require('dotenv').config({ path: __dirname + '/.env' })
const { renameIncomeImagePattern } = require('./global/helper')

const PORT = process.env.PORT || 8090;

const { getCategory } = require('./global/helper')
const constants = require('./global/constants')
const {
  auth,
  public,
  work,
  contact,
  shots,
  photos,
  slider,
  photoCollections,
} = require('./routes')

const storageConfig = multer.diskStorage({
  destination(req, file, callback) {
    try {
      const domain = req.headers.domain // 🔴

      if (domain) {
        const category = getCategory(req.originalUrl, constants.categories)
        if (category) {
          const dest = path.resolve(`${__dirname}/public/uploads/${domain}/${category}`)
          fs.access(dest, (error) => {
            if (error) {
              console.error("Directory does not exist ✘ ⛔ ", dest);
              return fs.mkdir(dest, (error) => callback(error, dest));
            } else {
              console.warn("Directory exists ✔ ✅");
              return callback(null, dest);
            }
          });
        } else {
          // обробити помилку
          console.error('FILE UPLOADING ERROR')
        }
      }
    } catch (e) {
      console.error(e)
    }
    // how save path to image in DB
    // https://stackoverflow.com/questions/46975942/how-to-send-image-name-in-database-using-multer-and-express/47560629
  },
  filename(req, file, callback) {
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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// routes:
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

const routeItems = [
  {
    path: '/public',
    routes: [
      public
    ]
  },
  {
    path: '/api', // add /api/v1
    routes: [
      auth,
      work,
      contact,
      shots,
      photos,
      slider,
      photoCollections
    ]
  }
]

for (const item of routeItems) {
  const { path, routes } = item
  for (const route of routes) {
    app.use(path, route)
  }
}

// routes error handler
app.use((req, res, next) => {
  res.status(404).send({ message: "Not Found" });
});

// run server
const server = app.listen(PORT, () => console.log('\x1b[33m%s\x1b[0m', `Server started on http://localhost:${PORT}/api/`))
server.setTimeout(5000);
