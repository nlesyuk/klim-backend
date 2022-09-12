const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;
const { removeUploadedFiles } = require('../global/helper')

const catchError = (err, res) => {
  let message = "Unauthorized!"
  const files = res?.req?.files
  // console.log('F', files)
  if (files) {
    removeUploadedFiles(files)
  }
  if (err instanceof TokenExpiredError) {
    message = "Unauthorized! Access Token was expired!"
  }
  return res.sendStatus(401).send({ message });
}

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;

    next();
  });
};


module.exports = {
  verifyToken: verifyToken,
  catchError: catchError,
};;
