const MicrosoftUser = require("../models/microsoftUser");

module.exports = {
  async saveUser(profile) {
    const userId = await MicrosoftUser.create({
      code: profile.id,
      name: profile.displayName
    });

    console.log(userId);
  }
}
