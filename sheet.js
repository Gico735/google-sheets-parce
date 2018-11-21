const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const bot = require('./bot')
// console.log(sendMsgToManager)

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), getSheets);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
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

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

const getIdManager = () => {
  sheets.spreadsheets.values.get({
    spreadsheetId: '1HsqTX1yflmDKHQ5zBY8YauqORh9ycFxcdtylin8Injc',
    range: '!A2:N',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      parseData(rows)
    } else {
      console.log('No data found.');
    }
  });
}

function getSheets(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1dX2Y1YuLrcV411fPhaWV5lyAclmrM4HlOtVlxYVzUtE',
    range: 'Projects!A2:N',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      parseData(rows)
    } else {
      console.log('No data found.');
    }
  });
}

const configureMsg = (msg) => {
  Object.keys(msg).map(manager => {
    const managerArr = msg[manager]
    let message = `Привет! ${manager} Это Onibot, пишу тебе, чтобы напомнить о том, что тебе нужно навести порядок в файлах своих проектов: \n\nАктуализируй сметы, иначе в реестре будут некорректные данные:`
    if (managerArr) {
      console.log(managerArr.length)
      managerArr.map(project => {
        if (project.estimate === 'Нет')
          return message += `\n☀ ${project.client} ${project.name}, вот ссылка на карточку ${project.link} \n\n`
      })
      bot.sendMsgToManager(message)
      message = 'А у этих проектов тебе нужно актуализировать % завершенности:'
      managerArr.map(project => {
        if (project.complete === 'Нет')
          return message += `\n☀ ${project.client} ${project.name}, вот ссылка на карточку ${project.link} \n\n`
      })
      bot.sendMsgToManager(message)
    }
  })
}



parseData = (rows) => {
  console.log('look on all info:')
  const msg = {}
  rows.forEach((row, i) => {
    // if (i === 1) {
    //   console.log(0, row[0])
    //   console.log(1, row[1])
    //   console.log(2, row[2])
    //   console.log(3, row[3])
    //   console.log(4, row[4])
    //   console.log(5, row[5])
    //   console.log(6, row[6])
    //   console.log(7, row[7])
    //   console.log(8, row[8])
    //   console.log(9, row[9])
    //   console.log(10, row[10])
    //   console.log(11, row[11])
    //   console.log(12, row[12])
    //   console.log(13, row[13])
    // }
    if (row[2] === '#N/A' || row[2] === '') return
    if (row[1].toLowerCase() === 'нет' || row[1] === '') {
      if (row[7].toLowerCase() === 'нет' || row[13].toLowerCase() === 'нет') {
        if (!msg[row[2]]) {
          msg[row[2]] = []
        }
        const project = {}
        project.name = row[4]
        project.client = row[3]
        project.estimate = row[7]
        project.complete = row[13]
        project.link = row[0]

        return msg[row[2]].push(project)
      }
    }
  })
  // console.log(msg['Сиденко Ю.'].length)
  configureMsg(msg)
}