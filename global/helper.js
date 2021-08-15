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

// module.exports = {
//   getHost,
//   getCategory,
//   Inserts
// }