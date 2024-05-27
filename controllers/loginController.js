const MicrosoftUser = require("../models/microsoftUser");
const FacebookUser = require("../models/facebookUser");
const GoogleUser = require("../models/googleUser");
const { log } = require("handlebars");

module.exports = {
  async saveMicrosoftUser(profile) {
    try {
      await MicrosoftUser.create({
        code: profile.id,
        name: profile.displayName
      })
    } catch (err) {
      console.log(err)
    }
    return await MicrosoftUser.findUserByID(profile.id)
  },

  async saveGoogleUser(profile) {
    try {
      await GoogleUser.create({
        code: profile.id,
        name: profile.displayName
      })
    } catch (err) {
      console.log(err)
    }
    return await GoogleUser.findByGoogleId(profile.id)
  },

  async saveFacebookUser(profile) {
    try {
      await FacebookUser.create({
        code: profile.id,
        name: profile.displayName
      });
    } catch (err) {
      log(err)
    }
    return FacebookUser.findByID(profile.id)
  }
}


