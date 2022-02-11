const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../classes/user')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}

module.exports = passport => {
  passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
      try {
        console.log(">>>>JWT>>>>", jwt_payload)
        const user = await User.findById(jwt_payload.userId)
        if (user) {
          const { id, username } = user
          done(null, { id, username })
        } else {
          done(null, false)
        }
      } catch (error) {
        console.error(error)
        done(error, false)
      }
    })
  )
}