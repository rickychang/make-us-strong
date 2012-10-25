var http = require('http');
var request = require('request')
var fs = require('fs');

function makeUsStrong(strengthener) {
    var memeGeneratorApiURL = 'http://version1.api.memegenerator.net/Instance_Create?username=pakledSOS&password=engage&languageCode=en&generatorID=1568864&imageID=6447360&text0=' + encodeURI(strengthener) + '&text1=makes%20us%20strong';
    request(memeGeneratorApiURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return JSON.parse(body)
        }
        else {
            return {}
        }
    })
};

function extractStrengthener(hostname) {
    var strengthener = null;
    if (hostname) {
        strengthener = hostname.split(":")[0].split(".")[0].replace("-"," ").toUpperCase()
    }
    return strengthener;
};

 
http.createServer(function (request, response) {
    var whatMakesUsStrong = extractStrengthener(request.headers.host)
    if (whatMakesUsStrong) {
        //var meme = makeUsStrong("node.js")
        //var memeImageUrl = meme['instanceImageUrl']
        var memeImageUrl = "http://cdn.memegenerator.net/instances/400x/28950782.jpg"
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('<!DOCTYPE html><html lang="en"><head>');
        response.write('<meta charset="utf-8">');
        response.write('<title>' + whatMakesUsStrong + ' MAKES US STRONG</title>');
        response.write('</head><body bgcolor="#000000">');
        response.write('<img src="' + memeImageUrl + '"/>');
        response.write('<object><param name="autostart" value="true">')
        response.write('<param name="src" value="http://www.trekcore.com/audio/computer/computerbeep_67.mp3">')
        response.write('<param name="autoplay" value="true">')
        response.write('<param name="controller" value="false">')
        response.write('<embed src="http://www.trekcore.com/audio/computer/computerbeep_67.mp3" controller="false" autoplay="true" autostart="True"/>')
        response.write('</object>')
        response.write('</body></html>');
        response.end();
    }
    console.log(request.headers.host);
    console.log('request starting...');
     
    
     
}).listen(8125);
