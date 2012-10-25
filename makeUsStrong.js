var http = require('http');
var request = require('request')
var fs = require('fs');


function extractStrengthener(hostname) {
    var strengthener = null;
    if (hostname) {
        strengthener = hostname.split(":")[0].split(".")[0].replace(/-/g," ").toUpperCase()
    }
    return strengthener;
};

var trekSounds = [
'http://www.trekcore.com/audio/computer/sequences/astrometrics_controls.mp3',
'http://www.trekcore.com/audio/computer/energize.mp3',
'http://www.trekcore.com/audio/computer/hailbeep_clean.mp3', 
'http://www.trekcore.com/audio/computer/computerbeep_69.mp3', 
'http://www.trekcore.com/audio/computer/computerbeep_37.mp3',
'http://www.trekcore.com/audio/computer/computer_work_beep.mp3',
'http://www.trekcore.com/audio/computer/critical.mp3',
'http://www.trekcore.com/audio/computer/processing2.mp3',
'http://www.trekcore.com/audio/computer/scrscroll2.mp3',
'http://www.trekcore.com/audio/computer/sequences/tactical_beep_sequence.mp3'
];

 
http.createServer(function (httpRequest, httpResponse) {
    var whatMakesUsStrong = extractStrengthener(httpRequest.headers.host)
    if (whatMakesUsStrong) {
        console.log(whatMakesUsStrong);
        var memeGeneratorApiURL = 'http://version1.api.memegenerator.net/Instance_Create?username=pakledSOS&password=engage&languageCode=en&generatorID=1568864&imageID=6447360&text0=' + encodeURI(whatMakesUsStrong) + '&text1=makes%20us%20strong';
        console.log(memeGeneratorApiURL);
        var randSound = trekSounds[Math.floor(Math.random() * trekSounds.length)]
        request(memeGeneratorApiURL, function (error, memeResponse, body) {
            if (!error && memeResponse.statusCode == 200) {
                    var memeImageUrl = JSON.parse(body)['result']['instanceImageUrl']
                    httpResponse.writeHead(200, { 'Content-Type': 'text/html' });
                    httpResponse.write('<!DOCTYPE html><html lang="en"><head>');
                    httpResponse.write('<meta charset="utf-8">');
                    httpResponse.write('<title>' + whatMakesUsStrong + ' MAKES US STRONG</title>');
                    httpResponse.write('</head><body bgcolor="#000000">');
                    httpResponse.write('<img src="' + memeImageUrl + '"/>');
                    httpResponse.write('<audio src="' + randSound + '" autoplay="true" autobuffer></audio>');
                    httpResponse.write('</body></html>');
                    httpResponse.end();
            }
            else {
                console.log(error);
                console.log(httpResponse.statusCode);
            }
        });
    }
}).listen(8125);
