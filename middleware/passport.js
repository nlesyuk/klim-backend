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
        const user = await User.findById({ id: jwt_payload.id })
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