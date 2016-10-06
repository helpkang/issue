
const Promise = require('./Promise')
const fs = require("fs");
Promise.promisifyAll(fs)


const google = require('googleapis')

const sheets = google.sheets('v4');

module.exports = function createSheet(auth, sheetFileInfo, sheetOptions) {

  return fs.readFileAsync(sheetFileInfo)
    .then((json) => {
      const sheetFileInfo = JSON.parse(json);
      return sheetFileInfo
    })
    .catch((error) => {
      return new Promise((resolve, reject) => {
        sheets.spreadsheets.create(
          Object.assign({auth: auth}, sheetOptions),
          function (err, response) {
            if (err) {
              reject(err)
              return;
            }
            fs.writeFileAsync(sheetFileInfo, JSON.stringify(response)).then(() => {
              resolve(response)
            }).catch(
              (error) => reject(error)
              )

          })
      })
    })

}
