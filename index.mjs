import { bot, getMsg, getMsgWrapper } from './bot.mjs'
import { auth, writeUserToSheet, getProjectInfo, getUserIds } from './sheet.mjs'
import { AssertionError } from 'assert';
// async function init() {
// try {
// const outRes = await auth()
auth()
setTimeout(() => {
  getProjectInfo()
  getUserIds()
}, 300);
// await console.log(outRes)
bot.onText(/\/start/, getMsg([console.log, writeUserToSheet]))
    // await bot.onText(/\/get/, getMsg([console.log, writeUserToSheet]))

//   } catch (error) {
//     console.log(error)
//   }
// }

// init()

