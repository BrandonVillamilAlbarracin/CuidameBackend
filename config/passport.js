const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const loginController = require('../controllers/loginController');
const User = require('../models/user');
const Keys = require('./keys');

module.exports = function(passport) {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = Keys.secretOrKey;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findbyId(jwt_payload.id, (err, user) => {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      }
      else {
        return done(null, false);
      }
    })
  }))

  var MicrosoftStrategy = require('passport-microsoft').Strategy;
  passport.use("microsoft", new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    tenant: 'consumer',
    callbackURL: 'http://localhost:3000/auth/microsoft/callback',
    authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: ["user.read"]
  }, async function(accessToken, refreshToken, profile, done) {
    await loginController.saveUser(profile);
    done(null, profile);
  })
  );
}
