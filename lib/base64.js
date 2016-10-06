const fs = require('fs')
const stream = require('stream');

function base64_decode(base64str, file) {
  // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
  const bitmap = new Buffer(base64str, 'base64');
  // write buffer to file
  fs.writeFileSync(file, bitmap);
}

function base64_decode_stream(base64str) {
  return new Buffer(base64str, 'base64')
}

function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  let str = new Buffer(bitmap).toString('base64');
  // console.log('strlen', str.length/1024)
  return str
}

module.exports = {
  base64_decode,
  base64_encode,
  base64_decode_stream,
}