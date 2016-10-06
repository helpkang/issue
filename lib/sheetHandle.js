
const Promise = require('./Promise')
const fs = require("fs");
Promise.promisifyAll(fs)


const google = require('googleapis')

const sheets = google.sheets('v4');

function appendData(options, datas) {
  return new Promise((resolve, reject) => {

    sheets.spreadsheets.values.append({
      auth: options.auth,
      spreadsheetId: options.spreadsheetId,
      range: 'issue!A1:C100000',
      valueInputOption: "USER_ENTERED",
      resource: {
        values: datas
      }
    }, function (err, response) {
      if (err) {
        reject(err)
        return;
      }
      resolve(true)

    })
  })
}


function getData(options) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      auth: options.auth,
      spreadsheetId: options.spreadsheetId,
      range: 'issue!A1:C1000',
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

module.exports = {
  appendData,
  getData,
}