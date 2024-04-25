const JwtStrategy = require('passport-jwt').Strategy;
var MicrosoftStrategy = require('passport-microsoft').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var FacebookStrategy = require('passport-google-oauth20').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const loginController = require('../controllers/loginController');
const User = require('../models/user');
const Keys = require('./keys');

module.exports = function (passport) {
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


  passport.use(
    "microsoft", new MicrosoftStrategy({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenant: 'consumer',
      callbackURL: 'http://localhost:3000/auth/microsoft/callback',
      authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scope: ["user.read"]
    }, async function (accessToken, refreshToken, profile, done) {
      await loginController.saveMicrosoftUser(profile);
      done(null, profile);
    })
  );
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
    async function (accessToken, refreshToken, profile, cb) {
      await loginController.saveGoogletUser(profile);

    }
  ));

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
    async function (accessToken, refreshToken, profile, cb) {
      await loginController.saveFacebooktUser(profile)

    }
  ));


}
