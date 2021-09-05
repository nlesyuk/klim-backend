exports.getCategory = function (rawUrl, categories) {
  // /api/work
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