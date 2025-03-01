const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(options, async (payload, done) => {
  try {
    if (!payload.userId) {
      const error = new Error('Unauthorized: Invalid token payload.');
      error.status = 401;
      return done(error, false);
    }

    // Directly trust the payload and pass the user info
    return done(null, { userId: payload.userId, email: payload.email });
  } catch (error) {
    console.error('JWT authentication error:', error);
    const authError = new Error('Authentication failed. Invalid token.');
    authError.status = 401;
    return done(authError, false);
  }
});

module.exports = (passport) => {
  passport.use(strategy);
};
