const MicrosoftUser = require("../models/microsoftUser");

module.exports = {
  async saveMicrosoftUser(profile) {
    const userId = await MicrosoftUser.create({
      code: profile.id,
      name: profile.displayName
    });

    console.log(userId);
  },

  async saveGoogletUser(profile) {
    const userId = await GoogleUser.create({
      code: profile.id,
      name: profile.displayName
    });

    console.log(userId);
  },
  async saveFacebooktUser(profile) {
    const userId = await FacebookUser.create({
      code: profile.id,
      name: profile.displayName
    });

    console.log(userId);
  }
}


