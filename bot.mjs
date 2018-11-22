import TelegramBot from 'node-telegram-bot-api'
import { token } from './tokenBot'

export const bot = new TelegramBot(token, {
  polling: true
});

export const getMsgWrapper = getMsg => cbs => {
  return function (msg) {
    let user = getMsg(msg)
    cbs.forEach(cb => cb(user))
  }
}

export const getMsg = (cbs) => (msg) => {
  // return new Promise((resolve, reject) => {
  const user = {}
  user.chatId = msg.chat.id;
  user.firstName = msg.chat.first_name
  user.lastName = msg.chat.last_name
  user.userName = msg.chat.username
  console.log('getMsg::', user)
  bot.sendMessage(user.chatId, ' Я тебя запомнил, после подтверждения твоего аккаунта Ты сможешь получать информацию по проектам');
  cbs.forEach(cb => cb(user))
  // resolve(true)
  // })
}




// bot.onText(/\/echo (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"
//   console.log(resp)
//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });


// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//   console.log(msg)
//   bot.sendMessage(chatId, 'Я тебя услышал');
// });

export const sendMsgToManager = (bot) => (id, msg) => {
  console.warn(id, msg)
  bot.sendMessage(id, msg)
}

// export default {
//   sendMsgToManager: sendMsgToManager(bot),
//   getMsg: getMsgWrapper(getMsg),
//   // getNewUser: getNewUser(bot)
// }