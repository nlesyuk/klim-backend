const authJwt = require("./authJwt");
const general = require("./general");

const adminCheck = [general.checkUserExisting, authJwt.verifyToken]
const visitorCheck = [general.checkUserExisting]

module.exports = {
  authJwt,
  general,
  visitorCheck,
  adminCheck,
};
