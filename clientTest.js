const http = require('http');

const {base64_encode} = require('./lib/base64')

var options = {
  host: '127.0.0.1',
  path: '/',
  port: '8080',
  method: 'POST'
}

function readJSONResponse(response) {
  let responseData = '';
  response.on('data', function (chunk) {
    responseData += chunk;
  });
  response.on('end', function () {
    // const dataObj = JSON.parse(responseData);
    console.log("Raw Response: " +responseData);
  });
}
const req = http.request(options, readJSONResponse);
let json = {
  title: '화면오류 발생',
  contents: '화면오류 발생\n어려운 문제는 없음\n시간이 걸릴뿐',
  screenId: 'sc0001',
  screenName: '로그인 화면',
  name: '아무개',
  tel: '01022999206',
  //추가 필요 디바이스명, os, version
  deviceOS: 'android',
  deviceVersion: '4.1',
  deviceName: 'sh4-1233',
  deviceInfo: {name:'', version:'',},


  files: [
    {
    mimeType: 'image/png',
    name: 'bird.png',
    body: base64_encode('/Users/gangseong-il/Downloads/bird.png'),
  },
  //   {
  //     mimeType: 'image/jpeg',
  //     name: 'album-kimgunmo-17.jpg',
  //     body: base64_encode('/Users/gangseong-il/Downloads/album-kimgunmo-17.jpg'),
  //   },
  ]
}

req.write(JSON.stringify(json));
req.end();