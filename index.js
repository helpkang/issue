
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
const {base64_decode, base64_decode_stream} = require('./lib/base64')

const config = require('./config')

const sheets = google.sheets('v4');



GoogleAuth(config.SCOPES, config.CLIENT_SECRET, config.OAUTH_OTKEN_PATH).then((auth) => {
  return [auth, createSheet(auth, config.SHEET_FILEINFO, config.SHEET_OPTIONS)]

})

  // .spread((options, result) => {
  //   return [options, sheetHandle.getData(options)]
  // })
  .spread((auth, sheetInfo) => {
    return [{ auth, sheetInfo, spreadsheetId: sheetInfo.spreadsheetId, parents: sheetInfo.parents }, null]
  })
  .spread((options) => {
    let port = 80
    if (process.argv[2]) {
      port = parseInt(process.argv[2])
    }

    httpDemon(options, port)
  })




function httpDemon(options, port) {

  http.createServer(function (req, res) {
    console.log(req.url)
    if (req.url !== '/uploadIssue') {
      res.end('error')
      return
    }
    let jsonData = "";

    req.on('data', function (chunk) {
      jsonData += chunk;
    });

    req.on('end', function () {
      try {
        processRequest(options, req, res, jsonData)
      } catch (e) {
        console.error(e)
        res.end(JSON.stringify({ success: false }))
      }
    });
  }).listen(port);

}

function processRequest(options, req, res, jsonData) {

  const reqObj = JSON.parse(jsonData);

  const promises = reqObj.files.map((file) => {
    console.log(file.mimeType)
    console.log(file.name)
    const { mimeType, name} = file

    const fileReadStream = base64_decode_stream(file.body)

    return fileSave(options, { mimeType, name, fileReadStream })
  })

  Promise.all(promises)
    .then((files) => {
      return appendSheet(options, reqObj, files)
    })
    .then(() => {
      console.log('end')
      res.writeHead(200)
      res.end(JSON.stringify({ success: true }))

    })

}



const fileSave = (options, params) => {
  const {mimeType, name, fileReadStream} = params
  const drive = google.drive('v3');
  const fileMetadata = {
    name,
    mimeType,
    parents: options.parents
  };
  const media = {
    name,
    mimeType,
    // body: fs.createReadStream(fileName),
    body: fileReadStream,
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


const appendSheet = (options, reqObj, files) => {
  moment.locale('ko');

  const {
    title,
    contents,
    screenId,
    screenName,
    name,
    tel,
    deviceOS,
    deviceVersion,
    deviceName,
    deviceInfo,
  } = reqObj

  const fileIds = files.map((file, idx) => {
    return `=HYPERLINK("https://drive.google.com/file/d/${file.id}", "imageLink ${++idx}")`
  })

  let fileFirstValue = (fileIds.length > 0) ? fileIds[0] : ''

  let fileSubValue = []
  if (fileFirstValue) {
    fileSubValue = fileIds.slice(1)
  }

  sheetHandle.appendData(
    options,
    [
      {
        "values": [
          title,
          contents,
          screenId,
          screenName,
          name,
          tel,
          moment().format('LLL'),
          fileFirstValue,
          deviceOS,
          deviceVersion,
          deviceName,
          JSON.stringify(deviceInfo),
          '등록',
          '미지정',
          ...fileSubValue,
        ]
      }
    ]
  )

}
