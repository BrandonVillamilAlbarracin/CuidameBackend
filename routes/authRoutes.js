const MicrosoftUser = require("../models/microsoftUser");

module.exports = (app, passport) => {
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
    function(req, res) {
      res.json(req.user);
    }
  );
}
