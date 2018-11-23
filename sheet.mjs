import fs from 'fs';
import readline from 'readline';
import googleapis from 'googleapis';
const google = googleapis.google
import { bot } from './bot.mjs'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

let sheets

export function auth() {
  fs.readFile('credentials.json', (err, content) => {
    if (err) console.log('Error loading client secret file: ' + err);
    authorize(JSON.parse(content), saveSheets);
  });
}

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


function saveSheets(auth) {
  sheets = google.sheets({ version: 'v4', auth });
}



export const getProjectInfo = () => {
  sheets.spreadsheets.values.get({
    spreadsheetId: '1dX2Y1YuLrcV411fPhaWV5lyAclmrM4HlOtVlxYVzUtE',
    range: 'Projects!A2:O',
  }, (err, res) => {
    if (err) return console.log('The API.getProjectInfo returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      parseDataProject(rows)
    } else {
      console.log('getProjectInfo:No data found.');
    }
  });
}

export const getUserIds = () => {
  sheets.spreadsheets.values.get({
    spreadsheetId: '1HsqTX1yflmDKHQ5zBY8YauqORh9ycFxcdtylin8Injc',
    range: 'List1!A2:D',
  }, (err, res) => {
    if (err) return console.log('The API.getUserIds returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      rows.map(row => {
        console.log(row)
        if (arrProjects[row[3]]) {
          arrProjects[row[3]].chatId = row[0]
        } else {
          arrProjects[row[3]] = {}
          arrProjects[row[3]].chatId = row[0]
          arrProjects[row[3]].projects = []
        }
      })
    } else {
      console.log('getUserIds:No data found.');
    }
  });
}

export function checkUser(user) {
  getUserIds()
  let oldUser = false
  Object.keys(arrProjects).forEach(manager => {
    if (+arrProjects[manager].chatId === +user.chatId) {
      oldUser = true
      return bot.sendMessage(user.chatId, 'Cтопе, Я тебя знаю ' + manager)
    }
  })
  if (!oldUser) {
    return writeUserToSheet(user)
  }
}


export const giveInfoFromCyrillicName = () => {
  sheets.spreadsheets.values.batchGet({
    spreadsheetId: '1HsqTX1yflmDKHQ5zBY8YauqORh9ycFxcdtylin8Injc',
    ranges: 'поймайМеня!A1:N',
  }, (err, res) => {
    if (err) return console.log('The API.getUserIds returned an error: ' + err);
    const rows = res.data.values;
    console.log(res)
    // fs.writeFileSync('./test.json', ...res)
    console.log(res.data.valueRanges[0].values)
    if (rows.length) {
      rows.map(row => {
        console.log(row)
      })
    } else {
      console.log('getUserIds:No data found.');
    }
  });
}

export const giveArrOfSheets = () => {
  sheets.spreadsheets.get({
    spreadsheetId: '1HsqTX1yflmDKHQ5zBY8YauqORh9ycFxcdtylin8Injc',
  }, (err, res) => {
    if (err) return console.log('The API.getUserIds returned an error: ' + err);
    const rows = res.data.sheets;
    if (rows.length) {
      rows.map(row => {
        console.log(row)
      })
    }
  });
}


export async function writeUserToSheet(user) {
  // const sheets = google.sheets({ version: 'v4', AUTH });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: '1HsqTX1yflmDKHQ5zBY8YauqORh9ycFxcdtylin8Injc',
    range: 'List1!A:D',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        [user.chatId, user.firstName, user.lastName],
      ],
    }
  })
  console.log('writeUserToSheet::', user)
  return bot.sendMessage(user.chatId, 'Я тебя запомнил, после подтверждения твоего аккаунта Ты сможешь получать информацию по проектам')
}


export const configureMsg = () => {
  Object.keys(arrProjects).map(manager => {
    if (arrProjects[manager].chatId !== undefined) {
      const chatId = arrProjects[manager].chatId
      const managerArr = arrProjects[manager].projects
      let message = `Привет! ${manager} Это Onibot, пишу тебе, чтобы напомнить о том, что тебе нужно навести порядок в файлах своих проектов: \n\nАктуализируй сметы, иначе в реестре будут некорректные данные:`
      if (managerArr) {
        managerArr.map(project => {
          if (project.estimate === 'Нет')
            return message += `\n🔥 ${project.client} ${project.name}, вот ссылка на карточку ${project.link1} \n\n`
        })
        message += 'А у этих проектов тебе нужно актуализировать % завершенности:'
        managerArr.map(project => {
          if (project.complete === 'Нет')
            return message += `\n🔥 ${project.client} ${project.name}, вот ссылка на карточку ${project.link2} \n\n`
        })
        bot.sendMessage(chatId, message)
      }
    }
  })
}

export async function configureMsgForOne(user) {
  await getUserIds()
  // arrProjects['Корчкова А.'].projects = []
  Object.keys(arrProjects).map(manager => {
    if (+arrProjects[manager].chatId === +user.chatId) {
      const managerArr = arrProjects[manager].projects
      let message = `Привет! ${manager} Это Onibot, пишу тебе, чтобы напомнить о том, что тебе нужно навести порядок в файлах своих проектов: \n
      Актуализируй сметы, иначе в реестре будут некорректные данные:`
      if (managerArr.length) {
        let empty = managerArr.map(project => {
          if (project.estimate === 'Нет')
            return message += `\n🔥 ${project.client} ${project.name}, вот ссылка на карточку ${project.link1} \n\n`
        }).join('')
        message += 'У этих проектов тебе нужно актуализировать % завершенности:'
        managerArr.map(project => {
          if (project.complete === 'Нет')
            return message += `\n🔥 ${project.client} ${project.name}, вот ссылка на карточку ${project.link2} \n\n`
        })
        if (manager === 'Корчкова А.') console.log(11111, manager, empty)
        bot.sendMessage(user.chatId, message)
      } else {
        bot.sendMessage(user.chatId, `Привет! ${manager} Это Onibot, пишу тебе, чтобы сказать, что ты молодец\nвсе твои проекты оформлены правильно!`)
      }
    }
  })
}

const arrProjects = {}
const parseDataProject = (rows) => {
  console.log('look on all project:')
  rows.forEach((row, i) => {
    if (row[3] === '#N/A' || row[4] === '') return

    if (row[2].toLowerCase() === 'нет' || row[2] === '') {
      if (row[8].toLowerCase() === 'нет' || row[14].toLowerCase() === 'нет') {
        if (!arrProjects[row[3]]) {
          arrProjects[row[3]] = {}
          arrProjects[row[3]].projects = []
        }
        const project = {}
        project.name = row[5]
        project.client = row[4]
        if (row[3] === 'Корчкова А.') {
          project.estimate = 'Да'
        } else {
          project.estimate = row[8]
        }
        project.complete = row[14]
        project.link1 = row[0]
        project.link2 = row[1]

        return arrProjects[row[3]].projects.push(project)
      }
    }
  })
  console.log('I am all')
  // fs.writeFileSync('./test.json', JSON.stringify(arrProjects))
}