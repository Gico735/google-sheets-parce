const TelegramBot = require('node-telegram-bot-api');
const token = require('./tokenBot.json').token

const bot = new TelegramBot(token, {
  polling: true
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(msg)
  bot.sendMessage(chatId, 'Received your message');
});