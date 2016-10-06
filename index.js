
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
const {base64_decode} = require('./lib/base64')

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

  const promises = reqObj.files.map((file) => {
    console.log(file.mimeType)
    console.log(file.name)
    const { mimeType, name} = file
    const fileName ="/tmp/" + name
    
    base64_decode(file.body, fileName)

    return fileSave(options, {mimeType, name, fileName })
  })

  Promise.all(promises)
  .then((files)=>{
    console.log('end')
    res.writeHead(200)
    res.end(JSON.stringify({success:true}))

  })

}



const fileSave = (options, params) => {
  const {mimeType, name, fileName} = params
  const drive = google.drive('v3');
  const fileMetadata = {
    name,
    mimeType,
  };
  const media = {
    name,
    mimeType,
    body: fs.createReadStream(fileName),
  };
  return new Promise((resolve, reject) => {
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
  })

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
