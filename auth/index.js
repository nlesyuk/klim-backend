const passport = require('passport')

const checkJWTAuth = () => passport.authenticate('jwt', { session: false })
module.exports = {
  checkJWTAuth
}