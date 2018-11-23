import { bot, getMsg, helloMsg } from './bot.mjs'
import { auth, checkUser, getProjectInfo, getUserIds, configureMsgForOne, giveInfoFromCyrillicName, giveArrOfSheets } from './sheet.mjs'

auth()

setTimeout(() => {
  getProjectInfo()
  getUserIds()
}, 300);

// setTimeout(() => {
//   giveArrOfSheets()
// }, 300);


bot.onText(/\/start/, getMsg([checkUser]))
bot.onText(/\/project/, getMsg([configureMsgForOne]))