const fs = require('fs');

exports.getCategory = function (rawUrl, categories) {
  // /api/work
  console.log('GetCategory', rawUrl)
  const str = `${rawUrl}`
  const arr = str.split('/')
  const res = arr.filter(v => categories.indexOf(v) != -1)
  return res.length ? res[0] : null
}
exports.getHost = function (rawUrl) {
  // localhost:8080
  const str = `${rawUrl}`
  const idx = str.indexOf(':')
  return str.slice(0, idx)
}

exports.Inserts = function (template, data) {
  if (!(this instanceof Inserts)) {
    return new Inserts(template, data);
  }
  this._rawDBType = true;
  this.formatDBType = function () {
    return data.map(d => '(' + pgp.as.format(template, d) + ')').join(',');
  };
}

exports.getRightPathForImage = function (image) {
  return `//${process.env.PUBLIC_DOMAIN}:${process.env.PORT}/${image}`
}

exports.removeDomainFromImagePath = function (sourceImage) {
  let image = `${sourceImage}`
  const domain = `//${process.env.PUBLIC_DOMAIN}:${process.env.PORT}/`
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

exports.renameIncomeImagePattern = /[^a-zA-Z0-9.]/gi;

exports.removeUploadedFiles = function (files) {
  if (!files) {
    return false
  }

  try {
    Array.from(files).map(v => ({ path: v.path })).forEach(file => {
      fs.unlink(file.path, function (err) { // remove file
        if (err) {
          console.error("unlink can't delete file - ", file.path)
          throw err;
        }
        console.log('File deleted!');
      });
    })
  } catch (e) {
    console.log('Error while deleting file', e)
  }
}