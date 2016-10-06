
const Promise = require('./Promise')
const fs = require("fs");
Promise.promisifyAll(fs)

const readline = require('readline')

const googleAuth = require('google-auth-library')

const PromiseCancelError = require('./PromiseCancelError')






// Load client secrets from a local file.
module.exports = function( scopes, clientSecret, tokenPath ){
  return fs.readFileAsync(clientSecret)
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
    return authorize(credentials, scopes, tokenPath);
  })
  .catch(PromiseCancelError, (err) => {
    throw err
  })
  .catch((err) => {
    throw new PromiseCancelError('auth error: ' + err, err)
  })
}
  
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, scopes, tokenPath) {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  return fs.readFileAsync(tokenPath)
    .then((token) => {
      oauth2Client.credentials = JSON.parse(token);
      return oauth2Client
    })
    .catch((error) => {
      return getNewToken(oauth2Client, scopes, tokenPath);
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
function getNewToken(oauth2Client, scopes, tokenPath) {

  console.log('scopes', scopes)
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
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
        storeToken(token, tokenPath);
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
function storeToken(token, tokenPath) {
  fs.writeFile(tokenPath, JSON.stringify(token));
  console.log('Token stored to ' + tokenPath);
}



