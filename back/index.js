
const Promise = require('bluebird')
const fs = require("fs");
Promise.promisifyAll(fs)

const readline = require('readline')
const google = require('googleapis')
const googleAuth = require('google-auth-library')

const PromiseCancelError = require('./PromiseCancelError')

if (!Promise.prototype.spread) {
    Promise.prototype.spread = function (fn) {
        return this.then(function (args) {
            return Promise.all(args); // wait for all
        }).then(function(args){
         //this is always undefined in A+ complaint, but just in case
            return fn.apply(this, args); 
        });

    };

}


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  // 'https://spreadsheets.google.com/feeds',
  // 'https://docs.google.com/feeds',
  'https://www.googleapis.com/auth/drive',
  // 'https://www.googleapis.com/auth/drive.metadata',
  // 'https://www.googleapis.com/auth/drive.metadata.readonly',
  // 'https://www.googleapis.com/auth/drive.photos.readonly',
];
const TOKEN_DIR = __dirname + '/.credentials'
const TOKEN_PATH = TOKEN_DIR + '/sheets.googleapis.com-nodejs-quickstart.json'

// Load client secrets from a local file.
fs.readFileAsync('client_secret.json')
  .then((content) => {

    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    return JSON.parse(content)

  })
  .catch(PromiseCancelError, (err) => {
    throw err
  })
  .catch((err) => {
    throw new PromiseCancelError('Error loading client secret file: ' + err, err)
  })
  .then((credentials) => {
    return authorize(credentials);
  })
  .catch(PromiseCancelError, (err) => {
    throw err
  })
  .catch((err) => {
    throw new PromiseCancelError('auth error: ' + err, err)
  })
  .then((client) => {
    return [client, batchUpdate(client)]
  })
  .spread((client, result) => {
    return [client, get(client)]
  })
  .spread((client, result) => {
    console.log('result' + result)
  })
  .catch((err) => {
    console.log(err)
  })

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  return fs.readFileAsync(TOKEN_PATH)
    .then((token) => {
      oauth2Client.credentials = JSON.parse(token);
      return oauth2Client
    })
    .catch((error) => {
      return getNewToken(oauth2Client);
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {

    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err)
          return
        }
        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client)
      });
    })
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}



function batchUpdate(auth) {
  const LEN = 300
  new Promise((resolve, reject) => {

    sheets.spreadsheets.values.batchUpdate({
      auth: auth,
      spreadsheetId: '1v5aTNhF6bO4kjCldxD5rNLlK5hGePGmGqqD7T06HFTQ',
      resource: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: 'sheet1!A1:C' + LEN,
            "values": getArray(LEN)
          }
        ]
      }
    }, function (err, response) {
      if (err) {
        // console.log('The API returned an error: ' + err);
        reject(err)
        return;
      }
      // console.log('response %s', JSON.stringify(response))
      resolve(true)

    })
  })
}

function getArray(len) {
  let arr = []

  for (let i = 0; i < len; i++) {
    arr.push([
      i + 1, '가나다' + i, '라마바' + i
    ])
  }
  return arr
}
function update(auth) {
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: '1v5aTNhF6bO4kjCldxD5rNLlK5hGePGmGqqD7T06HFTQ',
    range: 'sheet1!A1:B1',
    valueInputOption: "USER_ENTERED",
    resource: {
      "values": [
        [
          '가나다', '라마바'
        ],
        // Additional rows ...
      ]
    }
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    console.log('response %s', JSON.stringify(response))
    get(auth)
  })
}


function get(auth) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      auth: auth,
      spreadsheetId: '1v5aTNhF6bO4kjCldxD5rNLlK5hGePGmGqqD7T06HFTQ',
      range: 'sheet1!A1:C100',
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err)
        return;
      }
      const rows = response.values;

      let retRows = []
      if (rows.length == 0) {
        console.log('No data found.');
      } else {
        console.log('Name, Major:');
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // Print columns A and E, which correspond to indices 0 and 4.
          // console.log('%s, %s', row[0], row[1]);
          retRows.push(row)
        }
        resolve(retRows)
      }
    })
  })
}


/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
const sheets = google.sheets('v4');
function listMajors(auth) {
  // get( auth)
  batchUpdate(auth)
  // listFiles(auth)

  // getFile(auth, {
  //   name: '1.png',
  //   id: '0B2yG1rqnMmt6ZEtISUF3YllvUWc',
  // })

}


const drive = google.drive('v3');
function listFiles(auth) {
  drive.files.list({
    auth: auth,
    pageSize: 10,
    fields: "nextPageToken, files(id, name)",
    q: "'0B2yG1rqnMmt6THRxVDdZTVZQeTQ' in parents"
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    const files = response.files;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log('%s (%s)', file.name, file.id);
        getFile(auth, file)
      }
    }
  });
}

function getFile(auth, file) {

  const dest = fs.createWriteStream('/tmp/' + file.name)
  drive.files.get({
    auth,
    fileId: file.id,
    alt: 'media',
  })
    .on('end', function () {
      console.log('Done')
    })
    .on('error', function (err) {
      console.log('Error during download', err)
    })
    .pipe(dest)

}
