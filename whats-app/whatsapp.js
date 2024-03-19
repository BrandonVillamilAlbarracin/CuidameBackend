const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  puppeteer: {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  },
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
  const number = "+573194843592";
    const text = "Hey An";
    const chatId = number.substring(1) + "@c.us";
    client.sendMessage(chatId, text);
});

client.on("message", (message) => {
  if (message.body === "!ping") {
    client.sendMessage(message.from, "pong");
  }
});

client.initialize();

module.exports = { client };
