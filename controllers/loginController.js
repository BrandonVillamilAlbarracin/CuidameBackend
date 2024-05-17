const MicrosoftUser = require("../models/microsoftUser");
const FacebookUser= require("../models/facebookUser");
const GoogleUser = require("../models/googleUser");
const { log } = require("handlebars");

module.exports = {
  async saveMicrosoftUser(profile) {
    const userId = await MicrosoftUser.create({
      code: profile.id,
      name: profile.displayName
    });

    console.log(userId);
  },

  async saveGoogleUser(profile) {
    const userId = await GoogleUser.create({
      code: profile.id,
      name: profile.displayName
    }).then(id=>id).catch(()=>profile.id);
    const user = await GoogleUser.findByGoogleId(userId)
    return user
  },

  async saveFacebookUser(profile) {
    try{
      const userId = await FacebookUser.create({
        code: profile.id,
        name: profile.displayName
      });
  
    }catch(err){
      log(err)
    }
  }
}


