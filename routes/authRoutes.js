const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const MicrosoftUser = require("../models/microsoftUser");
const FacebookUser= require("../models/facebookUser");
const GoogleUser = require("../models/googleUser");

module.exports = (app, passport) => {

  // Microsoft
  app.get('/auth/microsoft',
    passport.authenticate('microsoft', {
      // Optionally define any authentication parameters here
      // For example, the ones in https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow

      prompt: 'select_account',
      session: false
    })
  );

  app.get('/auth/microsoft/callback',
    passport.authenticate('microsoft', {
      failureRedirect: '/auth/microsoft',
      session: false
      // [Optional] The token URL. Defaults to `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`
    }),
    function (req, res) {
      res.json(req.user);
    }
  );

  //Google

  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      const user = req.user
      // Firmar Token
      const token = jwt.sign(
        { id: user.id, name: user.name },
        keys.secretOrKey,
        {
          //    expiresIn: (60*60*24)
        }
      );
      res.status(200).json({
        success: true,
        message: "Se ha autenticado correctamente",
        token: token,
      });
    });

    //Facebook

  app.get('/auth/facebook',
    passport.authenticate('facebook'));

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });
}
