/*global describe, it*/

var should = require('should'),
    async = require('async'),
    fs = require('fs');

fs.openSync('./test.json', 'w');
var readStream = fs.createReadStream('./test.json');
var writeStream = fs.createWriteStream('./test.json');

readStream.on('data', function(chunk) {
    console.log(chunk);
});

readStream.on('data', function() {
    console.log('data');
});

readStream.on('readable', function() {
    console.log('readable');
});

readStream.on('end', function() {
    console.log('end');
});


setTimeout(function() {
    writeStream.write('blabla');
},2000);
