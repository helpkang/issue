
const Promise = require('./Promise')
const fs = require("fs");
Promise.promisifyAll(fs)


const google = require('googleapis')

const sheets = google.sheets('v4');

const drive = google.drive('v3');

module.exports = function createSheet(auth, sheetFileInfo, sheetOptions) {

  return fs.readFileAsync(sheetFileInfo)
    .then((json) => {
      const sheetFileInfo = JSON.parse(json);
      return sheetFileInfo
    })
    .catch((error) => {
      return _createFolder(auth).then((folder) => {
        const options = Object.assign({ auth: auth }, sheetOptions)
        return _createSheet(auth, sheetFileInfo, options).then((sheetFile) => {
          return _updateSheet(auth, sheetFileInfo, folder, sheetFile)
        })
      })
    })

}

function _createSheet(auth, sheetFileInfo, sheetOptions) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.create(
      sheetOptions,
      function (err, file) {
        if (err) {
          reject(err)
          return;
        }
        resolve(file)
      })
  })
}


function _createFolder(auth) {
  return new Promise((resolve, reject) => {
    var fileMetadata = {
      'name': 'issue',
      'mimeType': 'application/vnd.google-apps.folder'
    };

    drive.files.create({
      auth,
      resource: fileMetadata,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        reject(err)
      } else {
        resolve(file)
      }
    });
  })
}
function _updateSheet(auth, sheetFileInfo, folder, sheetFile) {
  return new Promise((resolve, reject) => {

    drive.files.update({
      auth,
      fileId: sheetFile.spreadsheetId,
      addParents: [folder.id],
      fields: 'id, parents'
    }, function (err, file) {
      if (err) {
        reject(err)
        return;
      }
      const data = Object.assign({}, sheetFile, { parents: [folder.id] })
      fs.writeFileAsync(sheetFileInfo, JSON.stringify(data)).then(() => {
        resolve(data)
      }).catch(
        (error) => reject(error)
        )

    });
  })
}