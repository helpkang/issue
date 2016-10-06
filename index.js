
const Promise = require('./lib/Promise')
const fs = require("fs");
Promise.promisifyAll(fs)

const http = require('http')

const google = require('googleapis')

const moment = require('moment')

const PromiseCancelError = require('./lib/PromiseCancelError')

const GoogleAuth = require('./lib/GoogleAuth')

const createSheet = require('./lib/createSheet')
const sheetHandle = require('./lib/sheetHandle')

const config = require('./config')



const sheets = google.sheets('v4');



GoogleAuth(config.SCOPES, config.CLIENT_SECRET, config.OAUTH_OTKEN_PATH).then((auth) => {
  return [auth, createSheet(auth, config.SHEET_FILEINFO, config.SHEET_OPTIONS)]

})

  // .spread((options, result) => {
  //   return [options, sheetHandle.getData(options)]
  // })
  .spread((auth, sheetInfo) => {
    return [{ auth, sheetInfo, spreadsheetId: sheetInfo.spreadsheetId }, null]
  })
  .spread((options) => {
    httpDemon(options)

  })



function httpDemon(options) {


  http.createServer(function (req, res) {
    let jsonData = "";

    req.on('data', function (chunk) {
      jsonData += chunk;
    });

    req.on('end', function () {
      processRequest(options, req, res, jsonData)
    });
  }).listen(8080);

}

function processRequest(options, req, res, jsonData) {

  let reqObj = JSON.parse(jsonData);

  reqObj.files.map((file) => {
    console.log(file.mimeType)
    console.log(file.name)
    base64_decode(file.body, "/tmp/" + file.name)

    await fileSave(options, )
  })

  res.writeHead(200);
  res.end(JSON.stringify(resObj));
}

function base64_decode(base64str, file) {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  const bitmap = new Buffer(base64str, 'base64');
  // write buffer to file
  fs.writeFileSync(file, bitmap);
}


const fileSave = async (options, result) => {

  const drive = google.drive('v3');
  const fileMetadata = {
    name: 'bird.png',
    mimeType: 'image/png',
  };
  const media = {
    name: 'bird.png',
    mimeType: 'image/png',
    body: fs.createReadStream('/Users/gangseong-il/Downloads/bird.png'),
  };
  return [options, new Promise((resolve, reject) => {
    drive.files.create({
      auth: options.auth,
      resource: fileMetadata,
      media: media,
      fields: 'id',
    }, function (err, file) {
      if (err) {
        // Handle error
        console.log(err);
        resolve(err)
      } else {
        console.log('File Id: ', JSON.stringify(file));
        resolve(file)
      }
    })
  })]

}


const appendSheet = (options, file) => {
  moment.locale('ko');

  return [
    options,
    sheetHandle.appendData(
      options,
      [
        {
          "values": [
            '오류 발생입니다.',
            'co00102',
            '포인트해지',
            '아무개',
            '01082999206',
            moment().format('LLL'),
            'https://drive.google.com/file/d/' + file.id,
            'android',
            '4.1',
            'sh4-1233',
            '{json:"하하하"}',
            '등록',
            '미지정',
          ]
        }
      ]
    )
  ]
}



// return [auth, batchUpdate(client)]

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





/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */

function listMajors(auth) {
  // get( auth)
  batchUpdate(auth)
  // listFiles(auth)

  // getFile(auth, {
  //   name: '1.png',
  //   id: '0B2yG1rqnMmt6ZEtISUF3YllvUWc',
  // })

}


function listFiles(auth) {

  const drive = google.drive('v3');
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
