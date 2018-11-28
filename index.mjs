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

setInterval(() => {
  const time = new Date()
  if (time.getDay() === 2 && (time.getHours() >= 11 && time.getHours() <= 12)) {
    console.log('lets go send msgs')
  }
}, 5000);


bot.onText(/\/start/, getMsg([checkUser]))
bot.onText(/\/project/, getMsg([configureMsgForOne]))