var http = require('http');
var fs = require('fs')
var options = {
  host: '127.0.0.1',
  path: '/',
  port: '8080',
  method: 'POST'
};
function readJSONResponse(response) {
  var responseData = '';
  response.on('data', function (chunk) {
    responseData += chunk;
  });
  response.on('end', function () {
    var dataObj = JSON.parse(responseData);
    console.log("Raw Response: " +responseData);
    console.log("Message: " + dataObj.message);
    console.log("Question: " + dataObj.question);
  });
}
var req = http.request(options, readJSONResponse);
let json = {
  title: '화면오류 발생',
  screenId: 'sc0001',
  screenName: '로그인 화면',
  name: '아무개',
  tel: '01022999206',
  //추가 필요 디바이스명, os, version
  deviceOS: 'android',
  deviceVersion: '4.1',
  deviceName: 'sh4-1233',
  deviceInfo: {name:'', version:'',},


  files: [{
    mimeType: 'image/png',
    name: 'bird.png',
    body: base64_encode('/Users/gangseong-il/Downloads/bird.png'),
  }]
}
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    let str =  new Buffer(bitmap).toString('base64');
    console.log('strlen', str.length/1024)
    return str
}
req.write(JSON.stringify(json));

fs.readFile
req.end();