const fs = require('fs');
const path = require('path');
const db = require('../db/index')
const { v4: uuidv4 } = require("uuid");

function getCategory(rawUrl, categories) {
  // /api/work
  console.log('GetCategory', rawUrl)
  const str = `${rawUrl}`
  const arr = str.split('/')
  const res = arr.filter(v => categories.indexOf(v) != -1)
  return res.length ? res[0] : null
}


function getHost(rawUrl) {
  // localhost:8080
  const str = `${rawUrl}`
  const idx = str.indexOf(':')
  return str.slice(0, idx)
}


function getDomain() {
  return parseInt(process.env.IS_PROD)
    ? `//${process.env.PUBLIC_DOMAIN_PROD}`
    : `//${process.env.PUBLIC_DOMAIN_LOCAL}:${process.env.PORT}`
}


function getRightPathForImage(image) {
  return `${getDomain()}/${image}`
}


function prepareImagePathForDB(file) {
  const destination = file?.destination
  const filename = file?.filename
  if (destination && filename) {
    const arr = destination.split("/");
    const idx = arr.indexOf("public");
    const path = arr.slice(idx).join("/");
    return `${path}/${filename}`;
  }
  return null;
}


function removeDomainFromImagePath(sourceImage) {
  let image = `${sourceImage}`
  const domain = `//${getDomain()}/`
  const idx = image.indexOf()
  if (idx != -1) {
    image = image.slice(idx + domain.length)
  } else {
    const idx2 = image.indexOf(`public`)
    if (idx2 != -1) {
      image = image.slice(idx2)
    }
  }
  return image
}


const renameIncomeImagePattern = /[^a-zA-Z0-9.]/gi;


function removeUploadedFiles(files) {
  if (!files) {
    return false
  }

  try {
    Array
      .from(files)
      .map(v => ({ path: v.path }))
      .forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("unlink can't delete file - ", file.path)
            throw err;
          }
          console.log('File deleted!');
        });
      })
    return true
  } catch (e) {
    console.error('Error while deleting file', e)
    return false
  }
}

function removeFileByPath(path) {
  if (!path) {
    return false
  }

  try {
    fs.unlink(path, (err) => {
      if (err) {
        console.error("unlink can't delete file - ", file.path)
        throw err;
      }
      console.log('File deleted!');
    });
    return true
  } catch (e) {
    console.error('Error while deleting file', e)
    return false
  }
}

function removePhotoFromServer(files, keyContainPath = 'image') {
  // image - is default name of column in photos table whit contain path to image
  if (!files) {
    return false
  }

  try {
    let count = 0
    Array
      .from(removedPhotos.rows)
      .forEach(file => {
        // /home/ubuntu/www/klim-backend/global/public...
        // /home/ubuntu/www/klim-backend/public...
        const fullFilePath = path.resolve(`../${file[keyContainPath]}`)
        fs.unlink(fullFilePath, (err) => { // remove file
          if (err) {
            console.error("unlink can't delete file - ", file.image)
            throw err;
          }
          console.log('File deleted!');
          count++
        });
      })
    console.log(`Removed ${count} photos`)
  } catch (e) {
    console.log('Error while deleting file', e)
  }
}

function getCurrentDateTime() {
  const date = new Date()
  const ms = date.getMilliseconds()
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
  const dateFormated = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
    timeZone: 'Europe/Kiev',
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)

  // const dateFormated2 = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

  return `${dateFormated}:${ms}`
}

function prepareSlideDataForClient(slideDataRaw) {
  if (slideDataRaw?.rows?.[0]) {
    const { id, type, title, image, slide_order, videos, work_id, photo_id } = slideDataRaw.rows[0]
    const createdSlide = {
      id,
      type,
      title,
      image: image ? getRightPathForImage(image) : null,
      order: slide_order,
      videos: videos ? videos : null,
      workId: work_id,
      photoId: photo_id,
    }
    return createdSlide
  } else {
    return false
  }
}

// JWT
async function createRefreshToken(userId) {
  if (typeof userId !== 'number') {
    throw new Error(`userId should be number`)
  }
  const expiredAt = new Date();
  expiredAt.setSeconds(expiredAt.getSeconds() + process.env.JWT_REFRESH_EXPIRATION);
  const token = uuidv4();
  console.log('refreshToken--before-->>>>>')
  const updatedUser = await db.query(`
    UPDATE
      users
    SET
      refresh_token = $1,
      expiry_date = $2
    WHERE
      id = $3
    RETURNING *`,
    [token, expiredAt.getTime(), userId]
  )
  const refreshToken = updatedUser.rows[0]?.refresh_token
  console.log('refreshToken>>>>>', refreshToken)
  return refreshToken;
}

function isRefreshTokenExpired(expiryDate) {
  if (isNaN(Number(expiryDate))) {
    throw new Error('expiryDate should be a number, got', typeof expiryDate)
  }
  return new Date(expiryDate).getTime() < new Date().getTime();
};

module.exports = {
  removeDomainFromImagePath,
  renameIncomeImagePattern,
  removePhotoFromServer,
  prepareImagePathForDB,
  getRightPathForImage,
  prepareSlideDataForClient,
  removeUploadedFiles,
  removeFileByPath,
  getCategory,
  getDomain,
  getHost,
  getCurrentDateTime,
  createRefreshToken,
  isRefreshTokenExpired
}
