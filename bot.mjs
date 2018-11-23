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
  const user = {}
  user.chatId = msg.chat.id;
  user.firstName = msg.chat.first_name
  user.lastName = msg.chat.last_name
  user.userName = msg.chat.username
  console.log('getMsg::', user)
  cbs.forEach(cb => cb(user))
}

export const helloMsg = (user) => {
  bot.sendMessage(user.chatId, ' Я тебя запомнил, после подтверждения твоего аккаунта Ты сможешь получать информацию по проектам');
}

export const sendMsgToManager = (bot) => (id, msg) => {
  console.warn(id, msg)
  bot.sendMessage(id, msg)
}
