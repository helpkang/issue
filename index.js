
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

  const reqObj = JSON.parse(jsonData);

  const prs = reqObj.files.map((file) => {
    console.log(file.mimeType)
    console.log(file.name)
    base64_decode(file.body, "/tmp/" + file.name)

    return fileSave(options, )
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
