//var fs = require('fs');
//fs.createReadStream('./task/config.js').on('data',function(chunk){
//    console.log('/Read %d bytes of data', chunk.length);
//    console.log(chunk.length);
//    console.log(chunk);
//    console.log(Buffer.isBuffer(chunk));
//    console.log(Stream.isStream(chunk));
//});
var fs = require('fs');
fs.createReadStream('./task/config.js').on('data',function(file){
    console.log('/Read %d bytes of data', file.length);
    console.log(file.length);
    console.log(file);
    console.log(Buffer.isBuffer(file));
    //console.log(Stream.isStream(chunk));
    console.log(test2222); //测试fetch添加
});